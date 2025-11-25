from fastapi import HTTPException
from config.db import db
from datetime import datetime
import base64
from ultralytics import YOLO
import cv2
import numpy as np
from config.cloudinary_config import upload_image_cart
from models.vendor_carts import VendorCart

# Initialize YOLO model
model = YOLO("best.pt")

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

        # Postprocess predictions
        postprocessed_image = postprocess_predictions(preprocessed_image, predictions)

        # Upload original image to Cloudinary
        original_image_url = upload_image_cart(image_bytes, folder="vendor_carts/original")

        # Upload postprocessed image to Cloudinary
        _, encoded_image = cv2.imencode(".jpg", postprocessed_image)
        postprocessed_image_url = upload_image_cart(encoded_image.tobytes(), folder="vendor_carts/postprocessed")

        # Save to database with user ID
        vendor_cart_data = {
            "user_id": user_id,
            "original_image_url": original_image_url,
            "postprocessed_image_url": postprocessed_image_url,
            "predictions": predictions,
            "classification": classification,
            "confidence": confidence,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }

        try:
            inserted_cart = db["vendor_carts"].insert_one(vendor_cart_data)
            vendor_cart_data["_id"] = str(inserted_cart.inserted_id)
            # Only display if successfully inserted
            print("Data successfully inserted into MongoDB:", vendor_cart_data)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to save vendor cart data.")

        return {
            "success": True,
            "original_image_url": original_image_url,
            "postprocessed_image_url": postprocessed_image_url,
            "predictions": predictions or [],  # Ensure predictions is always an array
            "classification": classification,
            "confidence": confidence
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")