import os
import requests
import base64
import logging
import io
from PIL import Image, ImageDraw
from dotenv import load_dotenv
import cloudinary.uploader

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Constants
GOOGLE_CLOUD_VISION_API_KEY = os.getenv("GOOGLE_CLOUD_VISION_API_KEY")
VISION_API_URL = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_CLOUD_VISION_API_KEY}"

# Keywords to highlight in GREEN
POSITIVE_KEYWORDS = ["DEPARTMENT", "TRADE", "INDUSTRY", "CERTIFICATE", "REGISTRATION", "BUSINESS", "NAME"]

# ==========================================
# 1. HELPER: Extract Coordinates
# ==========================================
def extract_bounding_boxes(annotations: dict) -> dict:
    """
    Extract bounding boxes from Vision API response for Blocks and Words.
    """
    bounding_boxes = {
        "blocks": [],
        "words": []
    }
    
    try:
        if "fullTextAnnotation" not in annotations:
            return bounding_boxes
        
        document = annotations["fullTextAnnotation"]
        
        for page in document.get("pages", []):
            for block in page.get("blocks", []):
                # 1. Capture Blocks (Red Boxes)
                if "boundingBox" in block:
                    bounding_boxes["blocks"].append({
                        "vertices": [
                            {"x": v.get("x", 0), "y": v.get("y", 0)}
                            for v in block["boundingBox"].get("vertices", [])
                        ],
                        "confidence": block.get("confidence", 0)
                    })
                
                for paragraph in block.get("paragraphs", []):
                    for word in paragraph.get("words", []):
                        # 2. Capture Words (Green Boxes if matches keyword)
                        if "boundingBox" in word:
                            word_text = "".join([
                                symbol.get("text", "") 
                                for symbol in word.get("symbols", [])
                            ])
                            bounding_boxes["words"].append({
                                "text": word_text,
                                "vertices": [
                                    {"x": v.get("x", 0), "y": v.get("y", 0)}
                                    for v in word["boundingBox"].get("vertices", [])
                                ],
                                "confidence": word.get("confidence", 0)
                            })
                            
        return bounding_boxes
    except Exception as e:
        logger.error(f"Error extracting bounding boxes: {str(e)}")
        return bounding_boxes

# ==========================================
# 2. CORE: Analyze & Draw
# ==========================================
async def generate_visual_evidence(image_url: str) -> dict:
    """
    Orchestrates the entire Visual Evidence process.
    HANDLES PDFs by converting them to PNGs first.
    """
    try:
        logger.info(f"🔍 Starting visual analysis for: {image_url}")

        # --- STEP A: Handle PDF vs Image ---
        # If it's a PDF, we change the URL to download a PNG version of Page 1.
        # Cloudinary allows this by changing the extension.
        download_url = image_url
        if image_url.lower().endswith('.pdf'):
            download_url = image_url.replace('.pdf', '.png')
            logger.info(f"📄 Detected PDF. Downloading as PNG for visualization: {download_url}")

        # --- STEP B: Download Image for Analysis ---
        response = requests.get(download_url)
        if response.status_code != 200:
            return {"success": False, "error": f"Failed to download image from {download_url}"}
        
        image_content = response.content
        encoded_image = base64.b64encode(image_content).decode('utf-8')

        # --- STEP C: Call Google Vision API ---
        payload = {
            "requests": [
                {
                    "image": {"content": encoded_image},
                    "features": [{"type": "DOCUMENT_TEXT_DETECTION", "maxResults": 1}]
                }
            ]
        }
        
        vision_resp = requests.post(VISION_API_URL, json=payload)
        vision_data = vision_resp.json()

        if "error" in vision_data:
            return {"success": False, "error": vision_data["error"]["message"]}
        
        if not vision_data.get("responses") or "fullTextAnnotation" not in vision_data["responses"][0]:
            return {"success": False, "error": "No text detected in image"}

        # Extract Boxes
        annotations = vision_data["responses"][0]
        boxes = extract_bounding_boxes(annotations)

        # --- STEP D: Draw Bounding Boxes (The Visualization) ---
        logger.info("🎨 Drawing bounding boxes...")
        
        try:
            image = Image.open(io.BytesIO(image_content))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            draw = ImageDraw.Draw(image)

            # 1. Draw Words (Green for Keywords)
            for word in boxes["words"]:
                text_content = word.get("text", "").upper()
                is_key_term = any(k in text_content for k in POSITIVE_KEYWORDS)
                
                vertices = word["vertices"]
                points = [(v.get("x",0), v.get("y",0)) for v in vertices]
                
                # Highlight Key Terms in GREEN
                if is_key_term:
                    draw.line(points + [points[0]], fill=(0, 255, 0), width=3)

            # 2. Draw Blocks (Red for Structure)
            for block in boxes["blocks"]:
                vertices = block["vertices"]
                points = [(v.get("x",0), v.get("y",0)) for v in vertices]
                draw.line(points + [points[0]], fill=(255, 0, 0), width=2)

        except Exception as e:
            logger.error(f"Error processing image with PIL: {e}")
            return {"success": False, "error": "Image processing failed"}

        # --- STEP E: Upload Processed Image to Cloudinary ---
        logger.info("☁️ Uploading evidence image...")
        
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=85)
        buffered.seek(0)

        upload_result = cloudinary.uploader.upload(
            buffered,
            folder="processed_submissions",
            resource_type="image"
        )
        
        processed_url = upload_result.get('secure_url')

        return {
            "success": True,
            "file_url_processed": processed_url,
            "bounding_boxes": boxes 
        }

    except Exception as e:
        logger.error(f"❌ Visual Evidence Generation Failed: {str(e)}")
        return {"success": False, "error": str(e)}