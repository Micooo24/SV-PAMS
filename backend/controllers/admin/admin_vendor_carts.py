from config.db import db
from bson import ObjectId
from typing import Dict, List

def fetch_vendor_carts():
    try:
        # Fetch all vendor cart records from the "vendor_carts" collection
        vendor_carts = list(db["vendor_carts"].find())

        # Transform ObjectId to string for JSON serialization
        for cart in vendor_carts:
            cart["_id"] = str(cart["_id"])

        return vendor_carts
    except Exception as e:
        raise Exception(f"Failed to fetch vendor cart records: {str(e)}")

def update_vendor_cart_status(cart_id: str, status: str):
    try:
        # Debug: print database and collection info
        print(f"[DEBUG] Connected to database: {db.name}")
        print(f"[DEBUG] vendor_carts count: {db['vendor_carts'].count_documents({})}")
        result = db["vendor_carts"].update_one({"_id": ObjectId(cart_id)}, {"$set": {"status": status}})
        print(f"[DEBUG] update_one matched_count: {result.matched_count}, modified_count: {result.modified_count}")
        if result.matched_count == 0:
            print(f"[DEBUG] No vendor cart found with _id={cart_id}")
            raise Exception("Vendor cart report not found")
        return {"success": True, "status": status}
    except Exception as e:
        print(f"[DEBUG] Exception in update_vendor_cart_status: {e}")
        raise Exception(f"Failed to update status: {str(e)}")