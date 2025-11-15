try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    YOLO = None
    print("Warning: ultralytics not installed. YOLO functionality will be disabled.")

class YOLOModel:
    def __init__(self, model_path: str = "best.pt"):
        if not YOLO_AVAILABLE:
            raise ImportError("ultralytics package is required but not installed")
        self.model = YOLO(model_path)

    def predict(self, image_bytes: bytes):
        """
        Runs inference on an image.
        Returns predictions as list of dicts: box, confidence, class_id
        """
        image = Image.open(io.BytesIO(image_bytes))
        results = self.model(image)

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
        return predictions
