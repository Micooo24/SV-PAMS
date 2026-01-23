# import logging
# import os
# import requests
# import base64
# from dotenv import load_dotenv
# from utils.image_processor import draw_bounding_boxes_on_image

# load_dotenv()

# logger = logging.getLogger(__name__)



# GOOGLE_CLOUD_VISION_API_KEY = os.getenv("GOOGLE_CLOUD_VISION_API_KEY")


# def extract_bounding_boxes(annotations: dict) -> dict:
#     """
#     Extract bounding boxes from Vision API response
#     """
#     bounding_boxes = {
#         "blocks": [],
#         "paragraphs": [],
#         "words": [],
#         "symbols": []
#     }
    
#     try:
#         if "fullTextAnnotation" not in annotations:
#             return bounding_boxes
        
#         document = annotations["fullTextAnnotation"]
        
#         for page in document.get("pages", []):
#             for block in page.get("blocks", []):
#                 if "boundingBox" in block:
#                     bounding_boxes["blocks"].append({
#                         "vertices": [
#                             {"x": v.get("x", 0), "y": v.get("y", 0)}
#                             for v in block["boundingBox"].get("vertices", [])
#                         ],
#                         "confidence": block.get("confidence", 0)
#                     })
                
#                 for paragraph in block.get("paragraphs", []):
#                     if "boundingBox" in paragraph:
#                         bounding_boxes["paragraphs"].append({
#                             "vertices": [
#                                 {"x": v.get("x", 0), "y": v.get("y", 0)}
#                                 for v in paragraph["boundingBox"].get("vertices", [])
#                             ],
#                             "confidence": paragraph.get("confidence", 0)
#                         })
                    
#                     for word in paragraph.get("words", []):
#                         if "boundingBox" in word:
#                             word_text = "".join([
#                                 symbol.get("text", "") 
#                                 for symbol in word.get("symbols", [])
#                             ])
#                             bounding_boxes["words"].append({
#                                 "text": word_text,
#                                 "vertices": [
#                                     {"x": v.get("x", 0), "y": v.get("y", 0)}
#                                     for v in word["boundingBox"].get("vertices", [])
#                                 ],
#                                 "confidence": word.get("confidence", 0)
#                             })
                        
#                         for symbol in word.get("symbols", []):
#                             if "boundingBox" in symbol:
#                                 bounding_boxes["symbols"].append({
#                                     "text": symbol.get("text", ""),
#                                     "vertices": [
#                                         {"x": v.get("x", 0), "y": v.get("y", 0)}
#                                         for v in symbol["boundingBox"].get("vertices", [])
#                                     ],
#                                     "confidence": symbol.get("confidence", 0)
#                                 })
        
#         logger.info(f"Extracted bounding boxes - Blocks: {len(bounding_boxes['blocks'])}, Words: {len(bounding_boxes['words'])}")
        
#     except Exception as e:
#         logger.error(f"Error extracting bounding boxes: {str(e)}")
    
#     return bounding_boxes


# async def analyze_document_with_vision(image_url: str) -> dict:
#     """
#     Analyze document using Google Vision API
#     """
#     try:
#         response = requests.get(image_url)
#         image_content = response.content
        
#         vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_CLOUD_VISION_API_KEY}"
#         encoded_image = base64.b64encode(image_content).decode('utf-8')
        
#         payload = {
#             "requests": [
#                 {
#                     "image": {"content": encoded_image},
#                     "features": [
#                         {"type": "DOCUMENT_TEXT_DETECTION", "maxResults": 1},
#                         {"type": "LABEL_DETECTION", "maxResults": 10},
#                         {"type": "OBJECT_LOCALIZATION", "maxResults": 10}
#                     ]
#                 }
#             ]
#         }
        
#         vision_response = requests.post(vision_url, json=payload)
#         vision_data = vision_response.json()
        
#         if "error" in vision_data:
#             logger.error(f"Vision API error: {vision_data['error']}")
#             return {"success": False, "error": vision_data["error"]["message"]}
        
#         annotations = vision_data["responses"][0]
        
#         extracted_text = ""
#         if "fullTextAnnotation" in annotations:
#             extracted_text = annotations["fullTextAnnotation"]["text"]
        
#         labels = []
#         if "labelAnnotations" in annotations:
#             labels = [
#                 {"label": label["description"], "confidence": label["score"]}
#                 for label in annotations["labelAnnotations"]
#             ]
        
#         objects = []
#         if "localizedObjectAnnotations" in annotations:
#             objects = [
#                 {
#                     "object": obj["name"],
#                     "confidence": obj["score"],
#                     "bounding_box": {
#                         "vertices": [
#                             {"x": v.get("x", 0), "y": v.get("y", 0)}
#                             for v in obj.get("boundingPoly", {}).get("normalizedVertices", [])
#                         ]
#                     }
#                 }
#                 for obj in annotations["localizedObjectAnnotations"]
#             ]
        
#         bounding_boxes = extract_bounding_boxes(annotations)
        
#         return {
#             "success": True,
#             "text": extracted_text,
#             "labels": labels,
#             "objects": objects,
#             "bounding_boxes": bounding_boxes
#         }
    
#     except Exception as e:
#         logger.error(f"Error analyzing document: {str(e)}")
#         return {"success": False, "error": str(e)}


# # changes here too
# async def compare_documents_with_vision(base_url: str, user_url: str) -> dict:
#     """
#     Compare documents and create processed image with bounding boxes
#     """
#     try:
#         logger.info("Starting document comparison with Vision API...")
        
#         # Analyze both documents
#         base_analysis = await analyze_document_with_vision(base_url)
#         user_analysis = await analyze_document_with_vision(user_url)
        
#         if not base_analysis["success"] or not user_analysis["success"]:
#             return {
#                 "success": False,
#                 "error": "Failed to analyze documents",
#                 "similarity_percentage": 0.0
#             }
        
#         # Calculate similarities
#         text_similarity = calculate_text_similarity(
#             base_analysis["text"],
#             user_analysis["text"]
#         )
        
#         label_similarity = calculate_label_similarity(
#             base_analysis["labels"],
#             user_analysis["labels"]
#         )
        
#         object_similarity = calculate_object_similarity(
#             base_analysis["objects"],
#             user_analysis["objects"]
#         )
        
#         # Spatial comparison
#         base_blocks = len(base_analysis["bounding_boxes"]["blocks"])
#         user_blocks = len(user_analysis["bounding_boxes"]["blocks"])
#         layout_similarity = (min(user_blocks, base_blocks) / max(user_blocks, base_blocks, 1)) * 100 if base_blocks > 0 else 0
        
#         # Weighted total
#         total_similarity = (
#             text_similarity * 0.4 +
#             label_similarity * 0.25 +
#             object_similarity * 0.15 +
#             layout_similarity * 0.2
#         )
        
#         logger.info(f"Comparison complete. Similarity: {total_similarity:.2f}%")
        
#         #  CREATE PROCESSED IMAGE with bounding boxes
#         logger.info("Creating processed image with bounding boxes...")
#         user_processed_url = draw_bounding_boxes_on_image(
#             user_url,
#             user_analysis["bounding_boxes"],
#             draw_words=True,
#             draw_blocks=True
#         )
        
#         if user_processed_url:
#             logger.info(f" Processed image created: {user_processed_url}")
#         else:
#             logger.error(" Failed to create processed image")
        
#         return {
#             "success": True,
#             "similarity_percentage": round(total_similarity, 1),
#             "details": {
#                 "text_similarity": round(text_similarity, 1),
#                 "label_similarity": round(label_similarity, 1),
#                 "object_similarity": round(object_similarity, 1),
#                 "layout_similarity": round(layout_similarity, 1)
#             },
#             "spatial_analysis": {
#                 "base_text_blocks": base_blocks,
#                 "user_text_blocks": user_blocks,
#                 "base_words": len(base_analysis["bounding_boxes"]["words"]),
#                 "user_words": len(user_analysis["bounding_boxes"]["words"]),
#                 "base_objects": len(base_analysis["objects"]),
#                 "user_objects": len(user_analysis["objects"])
#             },
#             "bounding_boxes": {
#                 "base_document": base_analysis["bounding_boxes"],
#                 "user_document": user_analysis["bounding_boxes"]
#             },
#             "processed_images": {
#                 "user_processed_url": user_processed_url  #  Return processed URL
#             }
#         }
    
#     except Exception as e:
#         logger.error(f"Error comparing documents: {str(e)}")
#         return {
#             "success": False,
#             "error": str(e),
#             "similarity_percentage": 0.0
#         }



# # These functions would be modify 
# def calculate_text_similarity(text1: str, text2: str) -> float:
#     if not text1 or not text2:
#         return 0.0
#     words1 = set(text1.lower().split())
#     words2 = set(text2.lower().split())
#     if not words1 or not words2:
#         return 0.0
#     intersection = words1.intersection(words2)
#     union = words1.union(words2)
#     return (len(intersection) / len(union)) * 100


# def calculate_label_similarity(labels1: list, labels2: list) -> float:
#     if not labels1 or not labels2:
#         return 0.0
#     labels1_set = {label["label"].lower() for label in labels1}
#     labels2_set = {label["label"].lower() for label in labels2}
#     intersection = labels1_set.intersection(labels2_set)
#     union = labels1_set.union(labels2_set)
#     if not union:
#         return 0.0
#     return (len(intersection) / len(union)) * 100


# def calculate_object_similarity(objects1: list, objects2: list) -> float:
#     if not objects1 or not objects2:
#         return 0.0
#     objects1_set = {obj["object"].lower() for obj in objects1}
#     objects2_set = {obj["object"].lower() for obj in objects2}
#     intersection = objects1_set.intersection(objects2_set)
#     union = objects1_set.union(objects2_set)
#     if not union:
#         return 0.0
#     return (len(intersection) / len(union)) * 100

#update as of 1/24/2026 many things to clarify

import logging
import os
import requests
import base64
from dotenv import load_dotenv
from utils.image_processor import draw_bounding_boxes_on_image

load_dotenv()

logger = logging.getLogger(__name__)

GOOGLE_CLOUD_VISION_API_KEY = os.getenv("GOOGLE_CLOUD_VISION_API_KEY")

def extract_bounding_boxes(annotations: dict) -> dict:
    """
    Extract bounding boxes from Vision API response
    """
    bounding_boxes = {
        "blocks": [],
        "paragraphs": [],
        "words": [],
        "symbols": []
    }
    
    try:
        if "fullTextAnnotation" not in annotations:
            return bounding_boxes
        
        document = annotations["fullTextAnnotation"]
        
        for page in document.get("pages", []):
            for block in page.get("blocks", []):
                if "boundingBox" in block:
                    bounding_boxes["blocks"].append({
                        "vertices": [
                            {"x": v.get("x", 0), "y": v.get("y", 0)}
                            for v in block["boundingBox"].get("vertices", [])
                        ],
                        "confidence": block.get("confidence", 0)
                    })
                
                for paragraph in block.get("paragraphs", []):
                    # We can skip paragraphs if you only visualize Blocks/Words to save space
                    pass 
                    
                    for word in paragraph.get("words", []):
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
        
        logger.info(f"Extracted bounding boxes - Blocks: {len(bounding_boxes['blocks'])}, Words: {len(bounding_boxes['words'])}")
        
    except Exception as e:
        logger.error(f"Error extracting bounding boxes: {str(e)}")
    
    return bounding_boxes


async def analyze_document_with_vision(image_url: str) -> dict:
    """
    Analyze document using Google Vision API to get Coordinates
    """
    try:
        response = requests.get(image_url)
        image_content = response.content
        
        vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_CLOUD_VISION_API_KEY}"
        encoded_image = base64.b64encode(image_content).decode('utf-8')
        
        payload = {
            "requests": [
                {
                    "image": {"content": encoded_image},
                    "features": [
                        {"type": "DOCUMENT_TEXT_DETECTION", "maxResults": 1},
                        # Removed LABEL and OBJECT detection to save API costs 
                        # since you are using Gemini for logic now.
                    ]
                }
            ]
        }
        
        vision_response = requests.post(vision_url, json=payload)
        vision_data = vision_response.json()
        
        if "error" in vision_data:
            logger.error(f"Vision API error: {vision_data['error']}")
            return {"success": False, "error": vision_data["error"]["message"]}
        
        # Handle cases where image has no text
        if not vision_data.get("responses"):
             return {"success": False, "error": "No response from Vision API"}

        annotations = vision_data["responses"][0]
        bounding_boxes = extract_bounding_boxes(annotations)
        
        return {
            "success": True,
            "bounding_boxes": bounding_boxes
        }
    
    except Exception as e:
        logger.error(f"Error analyzing document: {str(e)}")
        return {"success": False, "error": str(e)}


async def compare_documents_with_vision(base_url: str, user_url: str) -> dict:
    """
    PROCESS ONLY: Extracts bounding boxes and draws them on the user's image.
    REMOVED: All manual similarity calculations.
    """
    try:
        logger.info("Starting visual processing with Vision API...")
        
        # 1. Analyze User Document (We need coordinates to draw boxes)
        user_analysis = await analyze_document_with_vision(user_url)
        
        if not user_analysis["success"]:
            return {
                "success": False, 
                "error": "Failed to analyze user document"
            }
        
        # Note: We technically don't need to analyze the 'base_url' anymore 
        # if we aren't comparing them mathematically here. 
        # We just need to visualize the user's upload.

        # 2. CREATE PROCESSED IMAGE (Visual Evidence)
        logger.info("Creating processed image with bounding boxes...")
        user_processed_url = draw_bounding_boxes_on_image(
            user_url,
            user_analysis["bounding_boxes"],
            draw_words=True,   # Set to False if image gets too cluttered
            draw_blocks=True
        )
        
        if user_processed_url:
            logger.info(f"Processed image created: {user_processed_url}")
        else:
            logger.error("Failed to create processed image")
        
        # 3. RETURN RESULTS (Simplified)
        return {
            "success": True,
            # Pass the boxes back so you can store them in DB for reference
            "bounding_boxes": user_analysis["bounding_boxes"],
            # The URL of the image with Green Boxes
            "processed_images": {
                "user_processed_url": user_processed_url
            }
        }
    
    except Exception as e:
        logger.error(f"Error in visual processing: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }