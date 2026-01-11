from fastapi import HTTPException, Query
from typing import Optional
from config.db import db
from bson import ObjectId
from controllers.vendor_application_controller import calculate_completeness


def get_approved_vendors(
    goods_type: Optional[str] = None,
    delivery_capable: Optional[bool] = None,
    barangay: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get all approved vendors with filters (public access)"""
    
    # Query only approved applications with 90%+ completeness
    query = {"status": "approved"}
    
    if goods_type:
        query["goods_type"] = goods_type
    
    if delivery_capable is not None:
        query["delivery_capability"] = delivery_capable
    
    applications = list(
        db.vendor_applications.find(query)
        .sort("business_name", 1)
        .skip(skip)
        .limit(limit)
    )
    
    total = db.vendor_applications.count_documents(query)
    
    # Build response with vendor details
    result_vendors = []
    for app in applications:
        # Calculate completeness
        completeness = calculate_completeness(app)
        
        # Only include vendors with 90%+ completeness (activated vendors)
        if completeness < 90:
            continue
            
        # Get vendor user details
        vendor_user = db.users.find_one({"_id": app.get("user_id")})
        
        # Filter by barangay if specified
        if barangay and vendor_user and vendor_user.get("barangay") != barangay:
            continue
        
        result_vendors.append({
            "id": str(app.get("_id")),
            "business_name": app.get("business_name"),
            "goods_type": app.get("goods_type"),
            "cart_type": app.get("cart_type"),
            "operating_hours": app.get("operating_hours"),
            "area_of_operation": app.get("area_of_operation"),
            "delivery_capability": app.get("delivery_capability"),
            "years_in_operation": app.get("years_in_operation"),
            "business_logo_url": app.get("business_logo_url"),
            "vendor_barangay": vendor_user.get("barangay") if vendor_user else None,
            "completeness_percentage": completeness,
        })
    
    return {
        "total": len(result_vendors),
        "vendors": result_vendors,
    }


def get_vendor_detail(vendor_id: str):
    """Get detailed vendor information (public access)"""
    
    application = db.vendor_applications.find_one({"_id": ObjectId(vendor_id)})
    
    if not application:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Only show approved vendors
    if application.get("status") != "approved":
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Calculate completeness
    completeness = calculate_completeness(application)
    
    # Only show activated vendors (90%+)
    if completeness < 90:
        raise HTTPException(status_code=404, detail="Vendor profile incomplete")
    
    # Get vendor user details
    vendor_user = db.users.find_one({"_id": application.get("user_id")})
    
    return {
        "id": str(application.get("_id")),
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
        "business_logo_url": application.get("business_logo_url"),
        "cart_image_url": application.get("cart_image_url"),
        "vendor_photo_url": application.get("vendor_photo_url"),
        "vendor_name": f"{vendor_user.get('firstname')} {vendor_user.get('lastname')}" if vendor_user else "Unknown",
        "vendor_barangay": vendor_user.get("barangay") if vendor_user else None,
        "vendor_mobile_no": vendor_user.get("mobile_no") if vendor_user else None,
        "completeness_percentage": completeness,
    }


def get_vendor_categories():
    """Get all unique goods types/categories"""
    
    # Get distinct goods types from approved applications
    categories = db.vendor_applications.distinct("goods_type", {"status": "approved"})
    
    return {
        "categories": sorted([cat for cat in categories if cat])
    }
