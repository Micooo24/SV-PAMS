from fastapi import HTTPException
from models.vendors import Vendor
from typing import List
from pymongo.errors import PyMongoError
from config.db import db

vendors_collection = db["vendors"]

async def get_vendor_by_cart_id(cart_id: str) -> Vendor:
    vendor = await vendors_collection.find_one({"cart_id": cart_id})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return Vendor(**vendor)

async def get_all_vendors() -> List[Vendor]:
    vendors = vendors_collection.find()
    return [Vendor(**v) async for v in vendors]

async def create_vendor(vendor: Vendor) -> Vendor:
    try:
        await vendors_collection.insert_one(vendor.dict())
        return vendor
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))

async def update_vendor(cart_id: str, vendor_data: dict) -> Vendor:
    result = await vendors_collection.update_one({"cart_id": cart_id}, {"$set": vendor_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor = await vendors_collection.find_one({"cart_id": cart_id})
    return Vendor(**vendor)

async def delete_vendor(cart_id: str):
    result = await vendors_collection.delete_one({"cart_id": cart_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")