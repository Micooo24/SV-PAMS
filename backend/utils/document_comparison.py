import logging
import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


async def analyze_document_with_vision(image_url: str) -> dict:
    """
    Analyze document using Google Vision API
    Returns extracted text, labels, and objects (NO LOGO DETECTION)
    """
    try:
        # Download image from URL
        response = requests.get(image_url)
        image_content = response.content
        
        # Prepare Vision API request
        vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_API_KEY}"
        
        # Base64 encode image
        encoded_image = base64.b64encode(image_content).decode('utf-8')
        
        # Request payload (REMOVED LOGO_DETECTION)
        payload = {
            "requests": [
                {
                    "image": {
                        "content": encoded_image
                    },
                    "features": [
                        {"type": "DOCUMENT_TEXT_DETECTION", "maxResults": 1},  # Extract all text
                        {"type": "LABEL_DETECTION", "maxResults": 10},         # Document classification
                        {"type": "OBJECT_LOCALIZATION", "maxResults": 10}      # Stamps/signatures
                    ]
                }
            ]
        }
        
        # Call Google Vision API
        vision_response = requests.post(vision_url, json=payload)
        vision_data = vision_response.json()
        
        if "error" in vision_data:
            logger.error(f"Vision API error: {vision_data['error']}")
            return {
                "success": False,
                "error": vision_data["error"]["message"]
            }
        
        # Extract results
        annotations = vision_data["responses"][0]
        
        # Extract text
        extracted_text = ""
        if "fullTextAnnotation" in annotations:
            extracted_text = annotations["fullTextAnnotation"]["text"]
        
        # Extract labels
        labels = []
        if "labelAnnotations" in annotations:
            labels = [
                {
                    "label": label["description"],
                    "confidence": label["score"]
                }
                for label in annotations["labelAnnotations"]
            ]
        
        # Extract objects (stamps, signatures, seals)
        objects = []
        if "localizedObjectAnnotations" in annotations:
            objects = [
                {
                    "object": obj["name"],
                    "confidence": obj["score"]
                }
                for obj in annotations["localizedObjectAnnotations"]
            ]
        
        logger.info(f"Vision API analysis completed. Text length: {len(extracted_text)}")
        
        return {
            "success": True,
            "text": extracted_text,
            "labels": labels,
            "objects": objects
        }
    
    except Exception as e:
        logger.error(f"Error analyzing document with Vision API: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


async def compare_documents_with_vision(base_url: str, user_url: str) -> dict:
    """
    Compare two documents using Google Vision API
    Returns similarity percentage and comparison details (NO LOGO COMPARISON)
    """
    try:
        # Analyze both documents
        base_analysis = await analyze_document_with_vision(base_url)
        user_analysis = await analyze_document_with_vision(user_url)
        
        if not base_analysis["success"] or not user_analysis["success"]:
            return {
                "success": False,
                "error": "Failed to analyze documents",
                "similarity_percentage": 0.0
            }
        
        # Calculate similarity (3 metrics only)
        similarity_scores = []
        
        # 1. Text Similarity (50% weight) - INCREASED
        text_similarity = calculate_text_similarity(
            base_analysis["text"],
            user_analysis["text"]
        )
        similarity_scores.append(text_similarity * 0.5)
        
        # 2. Label Similarity (30% weight)
        label_similarity = calculate_label_similarity(
            base_analysis["labels"],
            user_analysis["labels"]
        )
        similarity_scores.append(label_similarity * 0.3)
        
        # 3. Object Similarity (20% weight) - INCREASED
        object_similarity = calculate_object_similarity(
            base_analysis["objects"],
            user_analysis["objects"]
        )
        similarity_scores.append(object_similarity * 0.2)
        
        # Total similarity
        total_similarity = sum(similarity_scores)
        
        logger.info(f"Document comparison completed. Similarity: {total_similarity:.2f}%")
        
        return {
            "success": True,
            "similarity_percentage": round(total_similarity, 1),
            "details": {
                "text_similarity": round(text_similarity, 1),
                "label_similarity": round(label_similarity, 1),
                "object_similarity": round(object_similarity, 1)
            }
        }
    
    except Exception as e:
        logger.error(f"Error comparing documents: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "similarity_percentage": 0.0
        }


def calculate_text_similarity(text1: str, text2: str) -> float:
    """Calculate text similarity using simple word overlap"""
    if not text1 or not text2:
        return 0.0
    
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    
    if not words1 or not words2:
        return 0.0
    
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    
    similarity = (len(intersection) / len(union)) * 100
    return min(similarity, 100.0)


def calculate_label_similarity(labels1: list, labels2: list) -> float:
    """Calculate similarity based on detected labels"""
    if not labels1 or not labels2:
        return 0.0
    
    labels1_set = {label["label"].lower() for label in labels1}
    labels2_set = {label["label"].lower() for label in labels2}
    
    intersection = labels1_set.intersection(labels2_set)
    union = labels1_set.union(labels2_set)
    
    if not union:
        return 0.0
    
    similarity = (len(intersection) / len(union)) * 100
    return min(similarity, 100.0)


def calculate_object_similarity(objects1: list, objects2: list) -> float:
    """Calculate similarity based on detected objects (stamps, signatures)"""
    if not objects1 or not objects2:
        return 0.0
    
    objects1_set = {obj["object"].lower() for obj in objects1}
    objects2_set = {obj["object"].lower() for obj in objects2}
    
    intersection = objects1_set.intersection(objects2_set)
    union = objects1_set.union(objects2_set)
    
    if not union:
        return 0.0
    
    similarity = (len(intersection) / len(union)) * 100
    return min(similarity, 100.0)