from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from controllers.vendor_carts import predict_vendor_cart
from datetime import datetime
from config.db import db
from bson import ObjectId
from typing import Optional

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...), email: str = Form(...)):
    """
    Upload and predict vendor cart image with text detection.
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image.")
        
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

@router.get("/vendor/cart-records")
def get_scan_records(
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    has_required_info: Optional[bool] = None,
    limit: int = 100
):
    """
    Get all vendor cart records with optional filters.
    Supports filtering by user_id, status, and has_required_info.
    """
    try:
        # Build filter query
        query = {}
        if user_id:
            query["user_id"] = user_id
        if status:
            query["status"] = status
        if has_required_info is not None:
            query["has_required_info"] = has_required_info
        
        # Fetch records with limit
        scan_records = list(db["vendor_carts"].find(query).limit(limit).sort("created_at", -1))

        # Transform ObjectId to string for JSON serialization
        for record in scan_records:
            record["_id"] = str(record["_id"])

        return {
            "success": True,
            "count": len(scan_records),
            "records": scan_records
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch scan records: {str(e)}")

@router.get("/vendor/cart-records/{cart_id}")
def get_cart_by_id(cart_id: str):
    """
    Get a specific cart record by ID with full text detection details.
    """
    try:
        if not ObjectId.is_valid(cart_id):
            raise HTTPException(status_code=400, detail="Invalid cart ID format.")
        
        record = db["vendor_carts"].find_one({"_id": ObjectId(cart_id)})
        
        if not record:
            raise HTTPException(status_code=404, detail="Cart record not found.")
        
        record["_id"] = str(record["_id"])
        
        return {
            "success": True,
            "record": record
        }
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cart record: {str(e)}")