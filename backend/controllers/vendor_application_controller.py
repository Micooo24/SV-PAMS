from fastapi import HTTPException, Depends
from datetime import datetime
from config.db import db
from models.vendor_application_model import VendorApplicationCreate
from utils.utils import get_current_user
from bson import ObjectId

def apply_as_vendor(
    data: VendorApplicationCreate,
    current_user=Depends(get_current_user)
):
    # Check for existing application
    existing = db.vendor_applications.find_one({
        "user_id": current_user["_id"],
        "status": {"$in": ["pending", "approved"]}
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have an existing application"
        )

    application = {
        "user_id": current_user["_id"],
        "business_name": data.business_name,
        "goods_type": data.goods_type,
        "cart_type": data.cart_type,
        "operating_hours": data.operating_hours,
        "area_of_operation": data.area_of_operation,
        "delivery_capability": data.delivery_capability,
        "products": [item.dict() for item in data.products] if data.products else [],
        "specialty_items": data.specialty_items,
        "preferred_contact": data.preferred_contact,
        "years_in_operation": data.years_in_operation,
        "social_media": data.social_media.dict() if data.social_media else None,
        "business_logo_url": data.business_logo_url,
        "cart_image_url": data.cart_image_url,
        "vendor_photo_url": data.vendor_photo_url,
        "status": "pending",
        "submitted_at": datetime.utcnow(),
        "reviewed_at": None
    }

    # Calculate and store completeness percentage
    application["completeness_percentage"] = calculate_completeness(application)

    db.vendor_applications.insert_one(application)

    return {
        "message": "Vendor application submitted successfully",
        "status": "pending"
    }


def get_vendor_application(current_user=Depends(get_current_user)):
    cursor = db.vendor_applications.find({"user_id": current_user["_id"]}).sort("submitted_at", -1).limit(1)
    application = next(cursor, None)

    if not application:
        raise HTTPException(status_code=404, detail="No application found for this user")

    # Calculate completeness percentage
    completeness = calculate_completeness(application)

    return {
        "id": str(application.get("_id")),
        "user_id": str(application.get("user_id")),
        "business_name": application.get("business_name"),
        "goods_type": application.get("goods_type"),
        "cart_type": application.get("cart_type"),
        "operating_hours": application.get("operating_hours"),
        "area_of_operation": application.get("area_of_operation"),
        "delivery_capability": application.get("delivery_capability"),
        "products": application.get("products"),
        "specialty_items": application.get("specialty_items"),
        "preferred_contact": application.get("preferred_contact"),
        "years_in_operation": application.get("years_in_operation"),
        "social_media": application.get("social_media"),
        "business_logo_url": application.get("business_logo_url"),
        "cart_image_url": application.get("cart_image_url"),
        "vendor_photo_url": application.get("vendor_photo_url"),
        "status": application.get("status"),
        "submitted_at": application.get("submitted_at"),
        "reviewed_at": application.get("reviewed_at"),
        "completeness_percentage": completeness,
    }


def calculate_completeness(app):
    """Calculate application completeness percentage"""
    total = 0
    
    # Required fields (40%)
    if app.get("business_name") and app.get("goods_type") and app.get("cart_type"):
        total += 40
    
    # Products (15%)
    if app.get("products") and len(app.get("products")) > 0:
        total += 15
    
    # Operating details (15%)
    if app.get("operating_hours") and app.get("area_of_operation"):
        total += 15
    
    # Years in operation (5%)
    if app.get("years_in_operation"):
        total += 5
    
    # Images (15% total - 5% each)
    if app.get("business_logo_url"):
        total += 5
    if app.get("cart_image_url"):
        total += 5
    if app.get("vendor_photo_url"):
        total += 5
    
    # Social media (5%)
    social = app.get("social_media")
    if social and (social.get("facebook") or social.get("instagram") or social.get("tiktok")):
        total += 5
    
    # Contact info (5%)
    if app.get("preferred_contact"):
        total += 5
    
    return min(total, 100)


def update_vendor_application(
    data: VendorApplicationCreate,
    current_user=Depends(get_current_user)
):
    """Update vendor application before approval"""
    # Find the application
    application = db.vendor_applications.find_one({
        "user_id": current_user["_id"],
        "status": {"$in": ["pending", "rejected"]}
    })

    if not application:
        raise HTTPException(
            status_code=404,
            detail="No pending or rejected application found to update"
        )

    # Prepare update data
    update_data = {
        "business_name": data.business_name,
        "goods_type": data.goods_type,
        "cart_type": data.cart_type,
        "operating_hours": data.operating_hours,
        "area_of_operation": data.area_of_operation,
        "delivery_capability": data.delivery_capability,
        "products": [item.dict() for item in data.products] if data.products else [],
        "specialty_items": data.specialty_items,
        "preferred_contact": data.preferred_contact,
        "years_in_operation": data.years_in_operation,
        "social_media": data.social_media.dict() if data.social_media else None,
        "business_logo_url": data.business_logo_url,
        "cart_image_url": data.cart_image_url,
        "vendor_photo_url": data.vendor_photo_url,
        "updated_at": datetime.utcnow()
    }

    # Calculate and update completeness percentage
    updated_app = {**application, **update_data}
    update_data["completeness_percentage"] = calculate_completeness(updated_app)

    # Update the application
    db.vendor_applications.update_one(
        {"_id": application["_id"]},
        {"$set": update_data}
    )

    return {
        "message": "Vendor application updated successfully",
        "status": application["status"]
    }


def activate_vendor_role(current_user=Depends(get_current_user)):
    """Activate vendor role for user with approved and complete application"""
    # Check if application exists and is approved
    application = db.vendor_applications.find_one({
        "user_id": current_user["_id"],
        "status": "approved"
    })

    if not application:
        raise HTTPException(
            status_code=404,
            detail="No approved application found"
        )

    # Check completeness
    completeness = calculate_completeness(application)
    if completeness < 90:
        raise HTTPException(
            status_code=400,
            detail=f"Application must be at least 90% complete to activate vendor role. Current: {completeness}%"
        )

    # Update user role to vendor
    result = db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"role": "vendor", "vendor_activated_at": datetime.utcnow()}}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=500,
            detail="Failed to update user role"
        )

    return {
        "message": "Vendor role activated successfully",
        "role": "vendor",
        "completeness": completeness
    }
