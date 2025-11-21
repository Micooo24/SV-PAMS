import io
import requests
from PIL import Image, ImageDraw, ImageFont
import logging
import cloudinary.uploader

logger = logging.getLogger(__name__)


def draw_bounding_boxes_on_image(image_url: str, bounding_boxes: dict, draw_words: bool = False, draw_blocks: bool = True):
    """
    Download image, draw bounding boxes with better visibility, upload to Cloudinary
    
    Args:
        draw_words: Draw word-level boxes (GREEN) - Default FALSE to reduce clutter
        draw_blocks: Draw block-level boxes (RED) - Default TRUE for better overview
    """
    try:
        logger.info(f" Downloading image from: {image_url}")
        response = requests.get(image_url)
        image = Image.open(io.BytesIO(response.content))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        draw = ImageDraw.Draw(image)
        
        #  Use bigger, bolder font
        try:
            font = ImageFont.truetype("arialbd.ttf", 18)  # Bold, size 18
        except:
            try:
                font = ImageFont.truetype("arial.ttf", 16)  # Regular, size 16
            except:
                font = ImageFont.load_default()
        
        #  ONLY draw block boxes by default (cleaner output)
        if draw_blocks and bounding_boxes.get("blocks"):
            logger.info(f" Drawing {len(bounding_boxes['blocks'])} block boxes")
            for idx, block in enumerate(bounding_boxes["blocks"]):
                if block.get("vertices") and len(block["vertices"]) == 4:
                    vertices = block["vertices"]
                    points = [
                        (vertices[0]["x"], vertices[0]["y"]),
                        (vertices[1]["x"], vertices[1]["y"]),
                        (vertices[2]["x"], vertices[2]["y"]),
                        (vertices[3]["x"], vertices[3]["y"]),
                        (vertices[0]["x"], vertices[0]["y"])
                    ]
                    
                    # Draw thicker red box
                    draw.line(points, fill=(220, 0, 0), width=4)
                    
                    #    Draw block number with dark background
                    block_label = f"Block {idx + 1}"
                    if block.get("confidence"):
                        block_label += f" ({block['confidence']:.0%})"
                    
                    text_x = vertices[0]["x"] + 5
                    text_y = vertices[0]["y"] - 30
                    
                    # Get text size
                    bbox = draw.textbbox((text_x, text_y), block_label, font=font)
                    
                    # Draw dark red background with padding
                    padding = 4
                    draw.rectangle(
                        [bbox[0] - padding, bbox[1] - padding, bbox[2] + padding, bbox[3] + padding],
                        fill=(150, 0, 0),  # Dark red background
                        outline=(220, 0, 0),
                        width=2
                    )
                    
                    # Draw white text on dark background
                    draw.text(
                        (text_x, text_y),
                        block_label,
                        fill=(255, 255, 255),  # White text
                        font=font
                    )
        
        #  Optional: Draw word boxes (disabled by default)
        if draw_words and bounding_boxes.get("words"):
            logger.info(f" Drawing {len(bounding_boxes['words'])} word boxes")
            for word in bounding_boxes["words"][:50]:  # Limit to first 50 words
                if word.get("vertices") and len(word["vertices"]) == 4:
                    vertices = word["vertices"]
                    points = [
                        (vertices[0]["x"], vertices[0]["y"]),
                        (vertices[1]["x"], vertices[1]["y"]),
                        (vertices[2]["x"], vertices[2]["y"]),
                        (vertices[3]["x"], vertices[3]["y"]),
                        (vertices[0]["x"], vertices[0]["y"])
                    ]
                    
                    # Draw thin green box
                    draw.line(points, fill=(0, 200, 0), width=1)
        
        # Convert to bytes
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=95)
        buffered.seek(0)
        
        # Upload to Cloudinary
        logger.info(" Uploading processed image to Cloudinary...")
        upload_result = cloudinary.uploader.upload(
            buffered,
            folder="processed_submissions",
            resource_type="image"
        )
        
        processed_url = upload_result['secure_url']
        logger.info(f" Processed image uploaded: {processed_url}")
        
        return processed_url
    
    except Exception as e:
        logger.error(f" Error processing image: {str(e)}")
        return None