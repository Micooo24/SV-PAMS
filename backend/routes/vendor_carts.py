# app/models/router.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from models.vendor_carts import YOLOModel

try:
    from models.vendor_carts import YOLOModel
    VENDOR_CARTS_ENABLED = True
except ImportError as e:
    VENDOR_CARTS_ENABLED = False
    print(f"Warning: Vendor carts disabled due to: {e}")
    YOLOModel = None

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not VENDOR_CARTS_ENABLED:
        raise HTTPException(status_code=500, detail="Vendor carts are disabled")
    image_bytes = await file.read()
    predictions = yolo_model.predict(image_bytes)
    return JSONResponse(content={"predictions": predictions})
