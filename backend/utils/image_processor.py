# import io
# import requests
# from PIL import Image, ImageDraw, ImageFont
# import logging
# import cloudinary.uploader

# logger = logging.getLogger(__name__)


# def draw_bounding_boxes_on_image(image_url: str, bounding_boxes: dict, draw_words: bool = False, draw_blocks: bool = True):
#     """
#     Download image, draw bounding boxes with better visibility, upload to Cloudinary
    
#     Args:
#         draw_words: Draw word-level boxes (GREEN) - Default FALSE to reduce clutter
#         draw_blocks: Draw block-level boxes (RED) - Default TRUE for better overview
#     """
#     try:
#         logger.info(f" Downloading image from: {image_url}")
#         response = requests.get(image_url)
#         image = Image.open(io.BytesIO(response.content))
        
#         if image.mode != 'RGB':
#             image = image.convert('RGB')
        
#         draw = ImageDraw.Draw(image)
        
#         #  Use bigger, bolder font
#         try:
#             font = ImageFont.truetype("arialbd.ttf", 18)  # Bold, size 18
#         except:
#             try:
#                 font = ImageFont.truetype("arial.ttf", 16)  # Regular, size 16
#             except:
#                 font = ImageFont.load_default()
        
#         #  ONLY draw block boxes by default (cleaner output)
#         if draw_blocks and bounding_boxes.get("blocks"):
#             logger.info(f" Drawing {len(bounding_boxes['blocks'])} block boxes")
#             for idx, block in enumerate(bounding_boxes["blocks"]):
#                 if block.get("vertices") and len(block["vertices"]) == 4:
#                     vertices = block["vertices"]
#                     points = [
#                         (vertices[0]["x"], vertices[0]["y"]),
#                         (vertices[1]["x"], vertices[1]["y"]),
#                         (vertices[2]["x"], vertices[2]["y"]),
#                         (vertices[3]["x"], vertices[3]["y"]),
#                         (vertices[0]["x"], vertices[0]["y"])
#                     ]
                    
#                     # Draw thicker red box
#                     draw.line(points, fill=(220, 0, 0), width=4)
                    
#                     #    Draw block number with dark background
#                     block_label = f"Block {idx + 1}"
#                     if block.get("confidence"):
#                         block_label += f" ({block['confidence']:.0%})"
                    
#                     text_x = vertices[0]["x"] + 5
#                     text_y = vertices[0]["y"] - 30
                    
#                     # Get text size
#                     bbox = draw.textbbox((text_x, text_y), block_label, font=font)
                    
#                     # Draw dark red background with padding
#                     padding = 4
#                     draw.rectangle(
#                         [bbox[0] - padding, bbox[1] - padding, bbox[2] + padding, bbox[3] + padding],
#                         fill=(150, 0, 0),  # Dark red background
#                         outline=(220, 0, 0),
#                         width=2
#                     )
                    
#                     # Draw white text on dark background
#                     draw.text(
#                         (text_x, text_y),
#                         block_label,
#                         fill=(255, 255, 255),  # White text
#                         font=font
#                     )
        
#         #  Optional: Draw word boxes (disabled by default)
#         if draw_words and bounding_boxes.get("words"):
#             logger.info(f" Drawing {len(bounding_boxes['words'])} word boxes")
#             for word in bounding_boxes["words"][:50]:  # Limit to first 50 words
#                 if word.get("vertices") and len(word["vertices"]) == 4:
#                     vertices = word["vertices"]
#                     points = [
#                         (vertices[0]["x"], vertices[0]["y"]),
#                         (vertices[1]["x"], vertices[1]["y"]),
#                         (vertices[2]["x"], vertices[2]["y"]),
#                         (vertices[3]["x"], vertices[3]["y"]),
#                         (vertices[0]["x"], vertices[0]["y"])
#                     ]
                    
#                     # Draw thin green box
#                     draw.line(points, fill=(0, 200, 0), width=1)
        
#         # Convert to bytes
#         buffered = io.BytesIO()
#         image.save(buffered, format="JPEG", quality=95)
#         buffered.seek(0)
        
#         # Upload to Cloudinary
#         logger.info(" Uploading processed image to Cloudinary...")
#         upload_result = cloudinary.uploader.upload(
#             buffered,
#             folder="processed_submissions",
#             resource_type="image"
#         )
        
#         processed_url = upload_result['secure_url']
#         logger.info(f" Processed image uploaded: {processed_url}")
        
#         return processed_url
    
#     except Exception as e:
#         logger.error(f" Error processing image: {str(e)}")
#         return None


#update as of 1/24/2026 many things to clarify

import io
import requests
from PIL import Image, ImageDraw, ImageFont
import logging
import cloudinary.uploader

logger = logging.getLogger(__name__)

def draw_bounding_boxes_on_image(image_url: str, bounding_boxes: dict, draw_words: bool = True, draw_blocks: bool = True):
    """
    Draws bounding boxes on the image to VISUALIZE what the AI saw.
    - GREEN BOXES: Valid Keywords (e.g., "Department of Trade", "Certificate")
    - RED BOXES: General Text Blocks (for layout verification)
    """
    try:
        logger.info(f"Downloading image from: {image_url}")
        response = requests.get(image_url)
        try:
            image = Image.open(io.BytesIO(response.content))
        except Exception:
            logger.error("Failed to open image. It might be a raw PDF.")
            return None # Skip visualization for raw PDFs

        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        draw = ImageDraw.Draw(image)
        
        # KEYWORDS TO HIGHLIGHT IN GREEN (Visual Proof of Validity)
        POSITIVE_KEYWORDS = ["DEPARTMENT", "TRADE", "INDUSTRY", "CERTIFICATE", "REGISTRATION", "BUSINESS", "NAME"]
        
        # 1. DRAW WORDS (Green for Verification Proof)
        if draw_words and bounding_boxes.get("words"):
            logger.info(f"Highlighting key terms...")
            
            for word in bounding_boxes["words"]:
                text_content = word.get("text", "").upper()
                
                # Check if this word is important
                is_key_term = any(k in text_content for k in POSITIVE_KEYWORDS)
                
                if word.get("vertices"):
                    vertices = word["vertices"]
                    points = [(v.get("x",0), v.get("y",0)) for v in vertices]
                    
                    # Highlight Key Terms in GREEN, others in thin GREY
                    if is_key_term:
                        draw.line(points + [points[0]], fill=(0, 255, 0), width=3) # Bright Green
                    else:
                        # Optional: Draw faint box around other text
                        # draw.line(points + [points[0]], fill=(200, 200, 200), width=1) 
                        pass

        # 2. DRAW BLOCKS (Red for Layout Proof)
        if draw_blocks and bounding_boxes.get("blocks"):
            logger.info(f"Drawing layout blocks...")
            
            for block in bounding_boxes["blocks"]:
                if block.get("vertices"):
                    vertices = block["vertices"]
                    points = [(v.get("x",0), v.get("y",0)) for v in vertices]
                    
                    # Draw Red Box (Layout Structure)
                    draw.line(points + [points[0]], fill=(255, 0, 0), width=2)

        # 3. UPLOAD PROCESSED IMAGE
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=85) # Optimize quality for speed
        buffered.seek(0)
        
        logger.info("Uploading evidence image...")
        upload_result = cloudinary.uploader.upload(
            buffered,
            folder="processed_submissions",
            resource_type="image"
        )
        
        return upload_result.get('secure_url')
    
    except Exception as e:
        logger.error(f"Error drawing boxes: {str(e)}")
        return None