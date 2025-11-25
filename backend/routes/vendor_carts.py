# app/models/router.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from fastapi.responses import JSONResponse
from controllers.vendor_carts import predict_vendor_cart
from datetime import datetime
from config.db import db
from bson import ObjectId

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...), email: str = Body(...)):
    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Call the controller function with the user's email
        result = await predict_vendor_cart(image_bytes, email)

        return JSONResponse(content=result)
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

@router.get("vendor/cart-records")
def get_scan_records():
    try:
        # Fetch all scan records from the "vendor_carts" collection
        scan_records = list(db["vendor_carts"].find())

        # Transform ObjectId to string for JSON serialization
        for record in scan_records:
            record["_id"] = str(record["_id"])

        return scan_records
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch scan records: {str(e)}")
