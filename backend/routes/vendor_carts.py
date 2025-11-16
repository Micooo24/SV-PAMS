# app/models/router.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from models.vendor_carts import YOLOModel

router = APIRouter()
yolo_model = YOLOModel("best.pt")

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        predictions = yolo_model.predict(image_bytes)
        
        return JSONResponse(content={"success": True, "predictions": predictions})
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)
