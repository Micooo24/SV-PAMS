import io
import base64
import requests
from PIL import Image, ImageDraw, ImageFont
import logging
import cloudinary.uploader

logger = logging.getLogger(__name__)


def draw_bounding_boxes_on_image(image_url: str, bounding_boxes: dict, draw_words: bool = True, draw_blocks: bool = True):
    """
    Download image, draw bounding boxes, upload to Cloudinary, return new URL
    
    Returns:
        Cloudinary URL of processed image with bounding boxes
    """
    try:
        # Download image
        logger.info(f"Downloading image from: {image_url}")
        response = requests.get(image_url)
        image = Image.open(io.BytesIO(response.content))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Create drawing context
        draw = ImageDraw.Draw(image)
        
        # Try to load a font
        try:
            font = ImageFont.truetype("arial.ttf", 12)
        except:
            font = ImageFont.load_default()
        
        # Draw word bounding boxes (GREEN)
        if draw_words and bounding_boxes.get("words"):
            logger.info(f"Drawing {len(bounding_boxes['words'])} word boxes")
            for word in bounding_boxes["words"]:
                if word.get("vertices") and len(word["vertices"]) == 4:
                    vertices = word["vertices"]
                    points = [
                        (vertices[0]["x"], vertices[0]["y"]),
                        (vertices[1]["x"], vertices[1]["y"]),
                        (vertices[2]["x"], vertices[2]["y"]),
                        (vertices[3]["x"], vertices[3]["y"]),
                        (vertices[0]["x"], vertices[0]["y"])
                    ]
                    
                    # Draw green box
                    draw.line(points, fill=(0, 255, 0), width=2)
                    
                    # Draw confidence score
                    if word.get("confidence"):
                        confidence_text = f"{word['confidence']:.2f}"
                        draw.text(
                            (vertices[0]["x"], vertices[0]["y"] - 15),
                            confidence_text,
                            fill=(0, 255, 0),
                            font=font
                        )
        
        # Draw block bounding boxes (RED)
        if draw_blocks and bounding_boxes.get("blocks"):
            logger.info(f"Drawing {len(bounding_boxes['blocks'])} block boxes")
            for block in bounding_boxes["blocks"]:
                if block.get("vertices") and len(block["vertices"]) == 4:
                    vertices = block["vertices"]
                    points = [
                        (vertices[0]["x"], vertices[0]["y"]),
                        (vertices[1]["x"], vertices[1]["y"]),
                        (vertices[2]["x"], vertices[2]["y"]),
                        (vertices[3]["x"], vertices[3]["y"]),
                        (vertices[0]["x"], vertices[0]["y"])
                    ]
                    
                    # Draw red box
                    draw.line(points, fill=(255, 0, 0), width=3)
                    
                    # Draw confidence score
                    if block.get("confidence"):
                        confidence_text = f"{block['confidence']:.2f}"
                        draw.text(
                            (vertices[0]["x"], vertices[0]["y"] - 20),
                            confidence_text,
                            fill=(255, 0, 0),
                            font=font
                        )
        
        # Convert image to bytes
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=95)
        buffered.seek(0)
        
        # Upload processed image to Cloudinary
        logger.info("Uploading processed image to Cloudinary...")
        upload_result = cloudinary.uploader.upload(
            buffered,
            folder="processed_submissions",
            resource_type="image"
        )
        
        processed_url = upload_result['secure_url']
        logger.info(f"Processed image uploaded: {processed_url}")
        
        return processed_url
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return None