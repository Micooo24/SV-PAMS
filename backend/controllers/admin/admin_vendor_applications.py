from fastapi import HTTPException, Depends
from datetime import datetime
from config.db import db
from utils.utils import get_current_user
from bson import ObjectId
from controllers.vendor_application_controller import calculate_completeness


def get_all_vendor_applications(
    status: str = None,
    skip: int = 0,
    limit: int = 50,
    current_user=Depends(get_current_user)
):
    """Get all vendor applications (admin only)"""
    # Verify admin access
    user = db.users.find_one({"_id": current_user["_id"]})
    if user.get("role") != "admin" and user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Admin access required")

    query = {}
    if status:
        query["status"] = status

    applications = list(
        db.vendor_applications.find(query)
        .sort("submitted_at", -1)
        .skip(skip)
        .limit(limit)
    )

    total = db.vendor_applications.count_documents(query)

    # Build response with vendor personal information
    result_applications = []
    for app in applications:
        vendor_user = db.users.find_one({"_id": app.get("user_id")})
        
        # Calculate completeness dynamically
        completeness = calculate_completeness(app)
        
        result_applications.append({
            "id": str(app.get("_id")),
            "user_id": str(app.get("user_id")),
            # Personal Information
            "vendor_firstname": vendor_user.get("firstname") if vendor_user else "Unknown",
            "vendor_lastname": vendor_user.get("lastname") if vendor_user else "Unknown",
            "vendor_email": vendor_user.get("email") if vendor_user else "Unknown",
            "vendor_barangay": vendor_user.get("barangay") if vendor_user else "Unknown",
            "vendor_address": vendor_user.get("address") if vendor_user else "Unknown",
            "vendor_mobile_no": vendor_user.get("mobile_no") if vendor_user else "Unknown",
            "vendor_landline_no": vendor_user.get("landline_no") if vendor_user else None,
            # Business Information - All Fields
            "business_name": app.get("business_name"),
            "goods_type": app.get("goods_type"),
            "cart_type": app.get("cart_type"),
            "operating_hours": app.get("operating_hours"),
            "area_of_operation": app.get("area_of_operation"),
            "delivery_capability": app.get("delivery_capability"),
            "products": app.get("products"),
            "specialty_items": app.get("specialty_items"),
            "preferred_contact": app.get("preferred_contact"),
            "years_in_operation": app.get("years_in_operation"),
            "social_media": app.get("social_media"),
            # Images
            "business_logo_url": app.get("business_logo_url"),
            "cart_image_url": app.get("cart_image_url"),
            "vendor_photo_url": app.get("vendor_photo_url"),
            # Status & Completeness
            "status": app.get("status"),
            "completeness_percentage": completeness,
            "submitted_at": app.get("submitted_at"),
            "reviewed_at": app.get("reviewed_at"),
            "rejection_reason": app.get("rejection_reason"),
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "applications": result_applications,
    }


def get_application_detail(
    application_id: str,
    current_user=Depends(get_current_user)
):
    """Get detailed vendor application (admin only)"""
    # Verify admin access
    user = db.users.find_one({"_id": current_user["_id"]})
    if user.get("role") != "admin" and user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Admin access required")

    application = db.vendor_applications.find_one({"_id": ObjectId(application_id)})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Get user details
    vendor_user = db.users.find_one({"_id": application.get("user_id")})

    # Calculate completeness dynamically
    completeness = calculate_completeness(application)

    return {
        "id": str(application.get("_id")),
        "user_id": str(application.get("user_id")),
        # Vendor Personal Information
        "vendor_firstname": vendor_user.get("firstname") if vendor_user else "Unknown",
        "vendor_lastname": vendor_user.get("lastname") if vendor_user else "Unknown",
        "vendor_email": vendor_user.get("email") if vendor_user else "Unknown",
        "vendor_barangay": vendor_user.get("barangay") if vendor_user else "Unknown",
        "vendor_address": vendor_user.get("address") if vendor_user else "Unknown",
        "vendor_mobile_no": vendor_user.get("mobile_no") if vendor_user else "Unknown",
        "vendor_landline_no": vendor_user.get("landline_no") if vendor_user else None,
        # Business Information
        "business_name": application.get("business_name"),
        "goods_type": application.get("goods_type"),
        "cart_type": application.get("cart_type"),
        "operating_hours": application.get("operating_hours"),
        "years_in_operation": application.get("years_in_operation"),
        "area_of_operation": application.get("area_of_operation"),
        "delivery_capability": application.get("delivery_capability"),
        "products": application.get("products"),
        "specialty_items": application.get("specialty_items"),
        "preferred_contact": application.get("preferred_contact"),
        "social_media": application.get("social_media"),
        # Image URLs
        "business_logo_url": application.get("business_logo_url"),
        "cart_image_url": application.get("cart_image_url"),
        "vendor_photo_url": application.get("vendor_photo_url"),
        # Application Status
        "status": application.get("status"),
        "completeness_percentage": completeness,
        "submitted_at": application.get("submitted_at"),
        "reviewed_at": application.get("reviewed_at"),
        "rejection_reason": application.get("rejection_reason"),
    }


def approve_application(
    application_id: str,
    current_user=Depends(get_current_user)
):
    """Approve vendor application (admin only)"""
    # Verify admin access
    user = db.users.find_one({"_id": current_user["_id"]})
    if user.get("role") != "admin" and user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Admin access required")

    application = db.vendor_applications.find_one({"_id": ObjectId(application_id)})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Update application status
    db.vendor_applications.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.utcnow(),
                "rejection_reason": None,
            }
        },
    )

    return {
        "message": "Application approved successfully",
        "status": "approved",
    }


def reject_application(
    application_id: str,
    rejection_reason: str,
    current_user=Depends(get_current_user)
):
    """Reject vendor application (admin only)"""
    # Verify admin access
    user = db.users.find_one({"_id": current_user["_id"]})
    if user.get("role") != "admin" and user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if not rejection_reason or len(rejection_reason.strip()) == 0:
        raise HTTPException(status_code=400, detail="Rejection reason is required")

    application = db.vendor_applications.find_one({"_id": ObjectId(application_id)})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Update application status
    db.vendor_applications.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": datetime.utcnow(),
                "rejection_reason": rejection_reason,
            }
        },
    )

    return {
        "message": "Application rejected successfully",
        "status": "rejected",
        "reason": rejection_reason,
    }


def request_missing_documents(
    application_id: str,
    missing_fields: list,
    message: str,
    current_user=Depends(get_current_user)
):
    """Request missing documents from vendor (admin only)"""
    # Verify admin access
    user = db.users.find_one({"_id": current_user["_id"]})
    if user.get("role") != "admin" and user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Admin access required")

    application = db.vendor_applications.find_one({"_id": ObjectId(application_id)})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Update with pending review status and missing fields
    db.vendor_applications.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$set": {
                "status": "pending_review",
                "missing_fields": missing_fields,
                "admin_message": message,
                "message_sent_at": datetime.utcnow(),
            }
        },
    )

    return {
        "message": "Request sent to vendor",
        "status": "pending_review",
        "missing_fields": missing_fields,
    }
