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