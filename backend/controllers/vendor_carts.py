from fastapi import HTTPException
from config.db import db
from datetime import datetime
import base64
from ultralytics import YOLO
import cv2
import numpy as np
from config.cloudinary_config import upload_image_cart
from models.vendor_carts import VendorCart
import os
import requests
import logging
import re
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize YOLO model
model = YOLO(os.path.join(os.path.dirname(__file__), '../secrets_backend/best.pt'))

# Text Extraction - Google Vision API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def extract_cart_registry_and_email(full_text: str, detected_texts: list):
    """
    Extract specific information: Cart Registry Number and Email from detected text.
    """
    cart_registry_no = None
    sanitary_email = None
    
    # More specific pattern for Cart Registry No - looks for 4-digit numbers near "CART REGISTRY"
    cart_registry_pattern = r'CART\s*REGISTRY\s*(?:NO|NUMBER)\.?\s*:?\s*(\d{4})'
    
    # Alternative: look for 4-digit number standalone
    standalone_number_pattern = r'\b(\d{4})\b'
    
    # Pattern for email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    
    # Pattern for PASIG text
    pasig_pattern = r'PASIG'
    
    # First, try to find cart number with context
    cart_match = re.search(cart_registry_pattern, full_text, re.IGNORECASE)
    if cart_match:
        cart_registry_no = cart_match.group(1)
    
    # If not found, search in individual detected texts with bounding box analysis
    if not cart_registry_no:
        # Sort detected texts by position (top to bottom, left to right)
        sorted_texts = sorted(detected_texts, key=lambda x: (x.get('box', [0,0,0,0])[1], x.get('box', [0,0,0,0])[0]))
        
        found_cart_label = False
        for i, text_obj in enumerate(sorted_texts):
            text = text_obj.get("text", "")
            
            # Look for "CART REGISTRY" label
            if re.search(r'CART\s*REGISTRY', text, re.IGNORECASE):
                found_cart_label = True
                # Check next 3 text blocks for 4-digit number
                for j in range(i+1, min(i+4, len(sorted_texts))):
                    next_text = sorted_texts[j].get("text", "")
                    number_match = re.search(standalone_number_pattern, next_text)
                    if number_match:
                        cart_registry_no = number_match.group(1)
                        break
                if cart_registry_no:
                    break
    
    # Fallback: find any 4-digit number (last resort)
    if not cart_registry_no:
        all_numbers = re.findall(standalone_number_pattern, full_text)
        # Filter out phone numbers and find most likely cart number
        for num in all_numbers:
            if num != '8643' and num != '1111' and num != '1531':  # Exclude known phone numbers
                cart_registry_no = num
                break
    
    # Email detection
    email_match = re.search(email_pattern, full_text)
    if email_match:
        sanitary_email = email_match.group(0).lower()
    
    pasig_match = re.search(pasig_pattern, full_text, re.IGNORECASE)
    is_pasig_cart = bool(pasig_match)
    
    logger.info(f"Full detected text: {full_text}")
    logger.info(f"All detected numbers: {re.findall(standalone_number_pattern, full_text)}")
    
    return {
        "cart_registry_no": cart_registry_no,
        "sanitary_email": sanitary_email,
        "is_pasig_cart": is_pasig_cart,
        "has_required_info": bool(cart_registry_no and sanitary_email)
    }

def extract_text_with_google_vision(image_bytes: bytes):
    """
    Extract text from image using Google Cloud Vision API (REST).
    Then filter for specific information.
    """
    try:
        vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_API_KEY}"
        encoded_image = base64.b64encode(image_bytes).decode('utf-8')
        
        payload = {
            "requests": [
                {
                    "image": {"content": encoded_image},
                    "features": [
                        {"type": "TEXT_DETECTION", "maxResults": 1}
                    ]
                }
            ]
        }
        
        vision_response = requests.post(vision_url, json=payload)
        vision_data = vision_response.json()
        
        if "error" in vision_data:
            logger.error(f"Vision API error: {vision_data['error']}")
            return {
                "full_text": "",
                "detected_texts": [],
                "cart_registry_no": None,
                "sanitary_email": None
            }
        
        annotations = vision_data["responses"][0]
        
        detected_texts = []
        full_text = ""
        
        if "textAnnotations" in annotations and len(annotations["textAnnotations"]) > 0:
            # First annotation contains full text
            full_text = annotations["textAnnotations"][0]["description"]
            
            # Individual text annotations with bounding boxes
            for text in annotations["textAnnotations"][1:]:  # Skip the first one (full text)
                vertices = text.get("boundingPoly", {}).get("vertices", [])
                if len(vertices) >= 4:
                    detected_texts.append({
                        "text": text.get("description", ""),
                        "confidence": 95.0,
                        "box": [
                            vertices[0].get("x", 0),
                            vertices[0].get("y", 0),
                            vertices[2].get("x", 0),
                            vertices[2].get("y", 0)
                        ]
                    })
        
        # Extract specific information
        specific_info = extract_cart_registry_and_email(full_text, detected_texts)
        
        logger.info(f"Extracted text - Cart Registry: {specific_info['cart_registry_no']}, Email: {specific_info['sanitary_email']}")
        
        return {
            "full_text": full_text.strip(),
            "detected_texts": detected_texts,
            "cart_registry_no": specific_info["cart_registry_no"],
            "sanitary_email": specific_info["sanitary_email"]
        }
    except Exception as e:
        logger.error(f"Error during text extraction with Google Vision: {e}")
        return {
            "full_text": "",
            "detected_texts": [],
            "cart_registry_no": None,
            "sanitary_email": None
        }

def preprocess_image(image_bytes: bytes):
    """
    Preprocess the image using OpenCV.
    Converts image bytes to a resized OpenCV image.
    """
    try:
        image_array = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Invalid image data")
        image = cv2.resize(image, (512, 512))
        return image
    except Exception as e:
        raise ValueError(f"Error during image preprocessing: {e}")

def postprocess_predictions(image, predictions):
    """
    Postprocess predictions using OpenCV.
    Draw bounding boxes and labels on the image.
    """
    try:
        for pred in predictions:
            box = pred["box"]
            confidence = pred["confidence"]
            class_id = pred["class_id"]
            start_point = (int(box[0]), int(box[1]))
            end_point = (int(box[2]), int(box[3]))
            color = (0, 255, 0)
            thickness = 2
            cv2.rectangle(image, start_point, end_point, color, thickness)
            label = f"{class_id}: {confidence:.2f}"
            cv2.putText(image, label, start_point, cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, thickness)
        return image
    except Exception as e:
        raise RuntimeError(f"Error during postprocessing: {e}")

async def predict_vendor_cart(image_bytes: bytes, email: str):
    try:
        # Retrieve user ID based on email
        user = db["users"].find_one({"email": email.lower().strip()})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user_id = str(user["_id"])

        # Preprocess image
        preprocessed_image = preprocess_image(image_bytes)

        # Run prediction
        results = model(preprocessed_image)
        predictions = []
        classification = None
        confidence = 0.0 

        for result in results:
            boxes = result.boxes.xyxy.tolist()
            confidences = result.boxes.conf.tolist()
            class_ids = result.boxes.cls.tolist()
            for box, conf, cls in zip(boxes, confidences, class_ids):
                predictions.append({
                    "box": box,
                    "confidence": conf,
                    "class_id": int(cls)
                })

                # Update classification and confidence with the highest confidence prediction
                if conf > confidence:
                    confidence = conf
                    classification = model.names[int(cls)] if hasattr(model, 'names') else str(cls)

        # Extract text using Google Cloud Vision REST API
        text_detection_result = extract_text_with_google_vision(image_bytes)

        # Postprocess predictions
        postprocessed_image = postprocess_predictions(preprocessed_image, predictions)

        # Upload original image to Cloudinary
        original_image_url = upload_image_cart(image_bytes, folder="vendor_carts/original")

        # Upload postprocessed image to Cloudinary
        _, encoded_image = cv2.imencode(".jpg", postprocessed_image)
        postprocessed_image_url = upload_image_cart(encoded_image.tobytes(), folder="vendor_carts/postprocessed")

        # Save to database with user ID and text detection
        vendor_cart_data = {
            "user_id": user_id,
            "original_image_url": original_image_url,
            "postprocessed_image_url": postprocessed_image_url,
            "predictions": predictions,
            "classification": classification,
            "confidence": confidence,
            "text_detection": text_detection_result,
            "cart_registry_no": text_detection_result.get("cart_registry_no"),
            "sanitary_email": text_detection_result.get("sanitary_email"),
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "status": "Pending"  
        }

        try:
            inserted_cart = db["vendor_carts"].insert_one(vendor_cart_data)
            vendor_cart_data["_id"] = str(inserted_cart.inserted_id)
            logger.info(f"Data successfully inserted into MongoDB: {vendor_cart_data}")
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to save vendor cart data.")

        return {
            "success": True,
            "original_image_url": original_image_url,
            "postprocessed_image_url": postprocessed_image_url,
            "predictions": predictions or [],
            "classification": classification,
            "confidence": confidence,
            "text_detection": text_detection_result,
            "cart_registry_no": text_detection_result.get("cart_registry_no"),
            "sanitary_email": text_detection_result.get("sanitary_email")
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")