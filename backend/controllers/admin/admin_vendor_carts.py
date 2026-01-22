from config.db import db
from bson import ObjectId
from typing import Dict, List, Optional
from datetime import datetime
from models.vendor_slots import VendorSlotConfig, VendorCartCreate, VendorCartUpdate

# ==================== SLOT CONFIGURATION ====================

DEFAULT_SLOT_CONFIG = {
    "max_slots": 100,
    "reserved_slots": 10,
    "area_slots": {
        "Market": 50,
        "School": 30,
        "Streets": 40,
        "Mall": 20
    },
    "is_accepting_applications": True,
    "updated_at": None,
    "updated_by": None
}

def get_slot_config():
    """Get current slot configuration"""
    try:
        config = db["slot_config"].find_one({"type": "vendor_slots"})
        if not config:
            # Initialize with default config
            config = {**DEFAULT_SLOT_CONFIG, "type": "vendor_slots"}
            db["slot_config"].insert_one(config)
            config = db["slot_config"].find_one({"type": "vendor_slots"})
        
        config["_id"] = str(config["_id"])
        return config
    except Exception as e:
        raise Exception(f"Failed to get slot config: {str(e)}")

def update_slot_config(config_data: dict, admin_id: str):
    """Update slot configuration (Admin only)"""
    try:
        update_data = {
            "max_slots": config_data.get("max_slots", 100),
            "reserved_slots": config_data.get("reserved_slots", 10),
            "area_slots": config_data.get("area_slots", DEFAULT_SLOT_CONFIG["area_slots"]),
            "is_accepting_applications": config_data.get("is_accepting_applications", True),
            "updated_at": datetime.utcnow().isoformat(),
            "updated_by": admin_id
        }
        
        result = db["slot_config"].update_one(
            {"type": "vendor_slots"},
            {"$set": update_data},
            upsert=True
        )
        
        return {"success": True, "message": "Slot configuration updated", "config": update_data}
    except Exception as e:
        raise Exception(f"Failed to update slot config: {str(e)}")

def get_slot_availability():
    """Get current slot availability statistics"""
    try:
        config = get_slot_config()
        
        # Count approved vendors
        approved_vendors = db["vendor_applications"].count_documents({"status": "approved"})
        
        # Count pending applications (reserved slots)
        pending_applications = db["vendor_applications"].count_documents({"status": "pending"})
        
        # Calculate availability
        max_slots = config.get("max_slots", 100)
        reserved = config.get("reserved_slots", 10)
        used_slots = approved_vendors + pending_applications
        available_slots = max(0, max_slots - used_slots - reserved)
        
        # Calculate per-area availability
        area_slots = config.get("area_slots", {})
        area_availability = {}
        
        for area, total in area_slots.items():
            # Count vendors in this area
            area_vendors = db["vendor_applications"].count_documents({
                "status": {"$in": ["approved", "pending"]},
                "area_of_operation": {"$in": [area]}
            })
            area_availability[area] = {
                "total": total,
                "used": area_vendors,
                "available": max(0, total - area_vendors)
            }
        
        return {
            "total_slots": max_slots,
            "used_slots": used_slots,
            "available_slots": available_slots,
            "reserved_slots": reserved,
            "pending_applications": pending_applications,
            "approved_vendors": approved_vendors,
            "is_accepting": config.get("is_accepting_applications", True) and available_slots > 0,
            "area_availability": area_availability
        }
    except Exception as e:
        raise Exception(f"Failed to get slot availability: {str(e)}")

# ==================== ELIGIBILITY CHECK ====================

def check_user_eligibility(user_id: str):
    """Check if a user is eligible to apply as a vendor"""
    try:
        eligibility = {
            "is_eligible": False,
            "criteria": {
                "slots_available": False,
                "valid_cart_scan": False,
                "has_registry_number": False,
                "no_existing_application": False,
                "documents_submitted": False
            },
            "missing_requirements": [],
            "message": ""
        }
        
        # 1. Check slot availability
        availability = get_slot_availability()
        eligibility["criteria"]["slots_available"] = availability["available_slots"] > 0 and availability["is_accepting"]
        if not eligibility["criteria"]["slots_available"]:
            eligibility["missing_requirements"].append("No vendor slots currently available")
        
        # 2. Check for valid cart scan (Pasig cart)
        cart_scan = db["vendor_carts"].find_one({
            "user_id": user_id,
            "is_pasig_cart": True
        })
        eligibility["criteria"]["valid_cart_scan"] = cart_scan is not None
        if not eligibility["criteria"]["valid_cart_scan"]:
            eligibility["missing_requirements"].append("Valid Pasig cart scan required")
        
        # 3. Check for cart registry number
        if cart_scan:
            eligibility["criteria"]["has_registry_number"] = bool(cart_scan.get("cart_registry_no"))
        if not eligibility["criteria"]["has_registry_number"]:
            eligibility["missing_requirements"].append("Cart registry number required")
        
        # 4. Check for existing application
        existing_app = db["vendor_applications"].find_one({
            "user_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id,
            "status": {"$in": ["pending", "approved"]}
        })
        eligibility["criteria"]["no_existing_application"] = existing_app is None
        if not eligibility["criteria"]["no_existing_application"]:
            eligibility["missing_requirements"].append(f"You already have a {existing_app['status']} application")
        
        # 5. Check for document submissions (optional but recommended)
        docs = db["document_submissions"].find_one({
            "user_id": user_id,
            "status": "approved"
        })
        eligibility["criteria"]["documents_submitted"] = docs is not None
        if not eligibility["criteria"]["documents_submitted"]:
            eligibility["missing_requirements"].append("Document submission recommended (optional)")
        
        # Determine overall eligibility (documents are optional)
        required_criteria = ["slots_available", "no_existing_application"]
        eligibility["is_eligible"] = all(eligibility["criteria"][c] for c in required_criteria)
        
        # Generate message
        if eligibility["is_eligible"]:
            eligibility["message"] = "You are eligible to apply as a vendor!"
        else:
            eligibility["message"] = f"Not eligible: {', '.join(eligibility['missing_requirements'][:2])}"
        
        return eligibility
    except Exception as e:
        raise Exception(f"Failed to check eligibility: {str(e)}")

def check_cart_eligibility(cart_id: str):
    """Check if a specific cart record is eligible for vendor application"""
    try:
        if not ObjectId.is_valid(cart_id):
            raise Exception("Invalid cart ID format")
        
        cart = db["vendor_carts"].find_one({"_id": ObjectId(cart_id)})
        if not cart:
            raise Exception("Cart not found")
        
        eligibility = {
            "cart_id": cart_id,
            "is_eligible": False,
            "criteria": {
                "is_pasig_cart": cart.get("is_pasig_cart", False),
                "has_registry_number": bool(cart.get("cart_registry_no")),
                "has_required_info": cart.get("has_required_info", False),
                "valid_classification": cart.get("classification") in ["with_cart", "vendor_cart", "valid"]
            },
            "cart_details": {
                "registry_no": cart.get("cart_registry_no"),
                "classification": cart.get("classification"),
                "confidence": cart.get("confidence"),
                "status": cart.get("status", "Pending")
            }
        }
        
        eligibility["is_eligible"] = (
            eligibility["criteria"]["is_pasig_cart"] and
            eligibility["criteria"]["has_registry_number"]
        )
        
        return eligibility
    except Exception as e:
        raise Exception(f"Failed to check cart eligibility: {str(e)}")

# ==================== CRUD OPERATIONS ====================

def fetch_vendor_carts(filters: dict = None, limit: int = 100, skip: int = 0):
    """Fetch all vendor cart records with optional filters"""
    try:
        query = filters or {}
        
        # Fetch vendor cart records
        vendor_carts = list(
            db["vendor_carts"]
            .find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )

        # Transform ObjectId to string
        for cart in vendor_carts:
            cart["_id"] = str(cart["_id"])

        total = db["vendor_carts"].count_documents(query)
        
        return {
            "records": vendor_carts,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise Exception(f"Failed to fetch vendor cart records: {str(e)}")

def get_vendor_cart_by_id(cart_id: str):
    """Get a single vendor cart record by ID"""
    try:
        if not ObjectId.is_valid(cart_id):
            raise Exception("Invalid cart ID format")
        
        cart = db["vendor_carts"].find_one({"_id": ObjectId(cart_id)})
        if not cart:
            raise Exception("Cart record not found")
        
        cart["_id"] = str(cart["_id"])
        return cart
    except Exception as e:
        raise Exception(f"Failed to fetch cart: {str(e)}")

def create_vendor_cart(data: VendorCartCreate):
    """Manually create a vendor cart record (Admin)"""
    try:
        cart_data = {
            "user_id": data.user_id,
            "cart_registry_no": data.cart_registry_no,
            "sanitary_email": data.sanitary_email,
            "is_pasig_cart": data.is_pasig_cart,
            "classification": data.classification,
            "confidence": data.confidence,
            "status": data.status,
            "notes": data.notes,
            "has_required_info": bool(data.cart_registry_no and data.sanitary_email),
            "created_at": datetime.utcnow().isoformat(),
            "created_manually": True,
            "original_image_url": None,
            "postprocessed_image_url": None,
            "predictions": []
        }
        
        result = db["vendor_carts"].insert_one(cart_data)
        cart_data["_id"] = str(result.inserted_id)
        
        return {"success": True, "message": "Cart record created", "cart": cart_data}
    except Exception as e:
        raise Exception(f"Failed to create cart: {str(e)}")

def update_vendor_cart(cart_id: str, data: VendorCartUpdate):
    """Update a vendor cart record"""
    try:
        if not ObjectId.is_valid(cart_id):
            raise Exception("Invalid cart ID format")
        
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Recalculate has_required_info if relevant fields are updated
        if "cart_registry_no" in update_data or "sanitary_email" in update_data:
            cart = db["vendor_carts"].find_one({"_id": ObjectId(cart_id)})
            if cart:
                registry = update_data.get("cart_registry_no", cart.get("cart_registry_no"))
                email = update_data.get("sanitary_email", cart.get("sanitary_email"))
                update_data["has_required_info"] = bool(registry and email)
        
        result = db["vendor_carts"].update_one(
            {"_id": ObjectId(cart_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise Exception("Cart record not found")
        
        return {"success": True, "message": "Cart record updated", "modified": result.modified_count}
    except Exception as e:
        raise Exception(f"Failed to update cart: {str(e)}")

def update_vendor_cart_status(cart_id: str, status: str):
    """Update only the status of a vendor cart"""
    try:
        print(f"[DEBUG] Connected to database: {db.name}")
        print(f"[DEBUG] vendor_carts count: {db['vendor_carts'].count_documents({})}")
        
        result = db["vendor_carts"].update_one(
            {"_id": ObjectId(cart_id)},
            {"$set": {"status": status, "updated_at": datetime.utcnow().isoformat()}}
        )
        
        print(f"[DEBUG] update_one matched_count: {result.matched_count}, modified_count: {result.modified_count}")
        
        if result.matched_count == 0:
            print(f"[DEBUG] No vendor cart found with _id={cart_id}")
            raise Exception("Vendor cart report not found")
        
        return {"success": True, "status": status}
    except Exception as e:
        print(f"[DEBUG] Exception in update_vendor_cart_status: {e}")
        raise Exception(f"Failed to update status: {str(e)}")

def delete_vendor_cart(cart_id: str):
    """Delete a vendor cart record"""
    try:
        if not ObjectId.is_valid(cart_id):
            raise Exception("Invalid cart ID format")
        
        result = db["vendor_carts"].delete_one({"_id": ObjectId(cart_id)})
        
        if result.deleted_count == 0:
            raise Exception("Cart record not found")
        
        return {"success": True, "message": "Cart record deleted"}
    except Exception as e:
        raise Exception(f"Failed to delete cart: {str(e)}")

# ==================== STATISTICS ====================

def get_vendor_cart_stats():
    """Get statistics for vendor carts"""
    try:
        total = db["vendor_carts"].count_documents({})
        
        # Status breakdown
        status_counts = {}
        for status in ["Pending", "Investigating", "Located", "Permit Processing", "Resolved", "Ignored"]:
            status_counts[status] = db["vendor_carts"].count_documents({"status": status})
        
        # Pasig cart count
        pasig_carts = db["vendor_carts"].count_documents({"is_pasig_cart": True})
        
        # With registry number
        with_registry = db["vendor_carts"].count_documents({
            "cart_registry_no": {"$ne": None, "$ne": ""}
        })
        
        # With required info
        with_required_info = db["vendor_carts"].count_documents({"has_required_info": True})
        
        return {
            "total": total,
            "status_breakdown": status_counts,
            "pasig_carts": pasig_carts,
            "with_registry_number": with_registry,
            "with_required_info": with_required_info
        }
    except Exception as e:
        raise Exception(f"Failed to get stats: {str(e)}")