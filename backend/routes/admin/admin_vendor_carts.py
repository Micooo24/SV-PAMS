from fastapi import APIRouter, HTTPException
from controllers.admin.admin_vendor_carts import fetch_vendor_carts

router = APIRouter()

@router.get("/get-all")
def get_vendor_carts():
    try:
        return fetch_vendor_carts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))