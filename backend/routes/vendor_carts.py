# app/models/router.py
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from models.vendor_carts import YOLOModel

router = APIRouter()
yolo_model = YOLOModel("best.pt")

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    predictions = yolo_model.predict(image_bytes)
    return JSONResponse(content={"predictions": predictions})
