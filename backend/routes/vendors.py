from fastapi import APIRouter, HTTPException, Body
from models.vendors import Vendor
from controllers.vendors import (
    get_vendor_by_cart_id,
    get_all_vendors,
    create_vendor,
    update_vendor,
    delete_vendor
)

router = APIRouter()

@router.get("/vendors", response_model=list[Vendor])
async def read_vendors():
    return get_all_vendors()

@router.get("/vendors/{cart_id}", response_model=Vendor)
async def read_vendor(cart_id: str):
    return get_vendor_by_cart_id(cart_id)

@router.post("/vendors", response_model=Vendor)
async def add_vendor(vendor: Vendor = Body(...)):
    return create_vendor(vendor)

@router.put("/vendors/{cart_id}", response_model=Vendor)
async def edit_vendor(cart_id: str, vendor_data: dict = Body(...)):
    return update_vendor(cart_id, vendor_data)

@router.delete("/vendors/{cart_id}")
async def remove_vendor(cart_id: str):
    delete_vendor(cart_id)
    return {"message": "Vendor deleted successfully"}