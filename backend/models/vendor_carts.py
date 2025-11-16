from ultralytics import YOLO
from PIL import Image
import io
import cv2
import numpy as np

class YOLOModel:
    def __init__(self, model_path: str = "best.pt"):
        try:
            self.model = YOLO(model_path)
        except Exception as e:
            raise RuntimeError(f"Failed to load YOLO model: {e}")

    def preprocess_image(self, image_bytes: bytes):
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

    def postprocess_predictions(self, image, predictions):
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
                cv2.rectangle(image, start_point, end_point, color, 2)
                label = f"Class {class_id}: {confidence:.2f}"
                cv2.putText(image, label, (int(box[0]), int(box[1]) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            return image
        except Exception as e:
            raise RuntimeError(f"Error during postprocessing: {e}")

    def predict(self, image_bytes: bytes):
        """
        Runs inference on an image.
        Returns predictions as a list of dicts: box, confidence, class_id.
        """
        try:
            image = self.preprocess_image(image_bytes)
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            results = self.model(pil_image)

            predictions = []
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

            processed_image = self.postprocess_predictions(image, predictions)
            cv2.imwrite("output.jpg", processed_image)

            return predictions
        except Exception as e:
            raise RuntimeError(f"Error during prediction: {e}")
