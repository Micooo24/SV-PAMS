from fastapi import HTTPException, Depends
from datetime import datetime
from config.db import db
from utils.utils import get_current_user
from bson import ObjectId
from typing import Optional, List


def get_vendor_report(
    vendor_type: str = None,
    area_of_operation: str = None,
    status: str = None,
    search: str = None,
    skip: int = 0,
    limit: int = 50,
    current_user=Depends(get_current_user)
):
    """Get comprehensive vendor report data (admin only)"""
    # Verify admin access
    user = db.users.find_one({"_id": current_user["_id"]})
    if user.get("role") not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Build query for approved vendor applications
    query = {"status": "approved"}
    
    if status and status != "all":
        query["status"] = status
    
    if vendor_type:
        query["goods_type"] = {"$regex": vendor_type, "$options": "i"}
    
    if area_of_operation:
        query["area_of_operation"] = {"$elemMatch": {"$regex": area_of_operation, "$options": "i"}}

    # Get vendor applications
    applications = list(
        db.vendor_applications.find(query)
        .sort("submitted_at", -1)
        .skip(skip)
        .limit(limit)
    )

    total = db.vendor_applications.count_documents(query)

    # Build comprehensive report
    report_data = []
    for app in applications:
        vendor_user = db.users.find_one({"_id": app.get("user_id")})
        
        # Apply search filter on vendor name or business name
        if search:
            search_lower = search.lower()
            vendor_name = f"{vendor_user.get('firstname', '')} {vendor_user.get('lastname', '')}".lower() if vendor_user else ""
            business_name = (app.get("business_name") or "").lower()
            
            if search_lower not in vendor_name and search_lower not in business_name:
                continue
        
        report_data.append({
            "id": str(app.get("_id")),
            "user_id": str(app.get("user_id")),
            # Vendor Personal Information
            "vendor_name": f"{vendor_user.get('firstname', '')} {vendor_user.get('lastname', '')}" if vendor_user else "Unknown",
            "vendor_firstname": vendor_user.get("firstname") if vendor_user else "Unknown",
            "vendor_lastname": vendor_user.get("lastname") if vendor_user else "Unknown",
            "vendor_email": vendor_user.get("email") if vendor_user else "Unknown",
            "vendor_mobile": vendor_user.get("mobile_no") if vendor_user else "N/A",
            "vendor_address": vendor_user.get("address") if vendor_user else "N/A",
            "vendor_barangay": vendor_user.get("barangay") if vendor_user else "N/A",
            # Business Information
            "business_name": app.get("business_name") or "N/A",
            "vendor_type": app.get("goods_type") or "N/A",
            "cart_type": app.get("cart_type") or "N/A",
            "operating_hours": app.get("operating_hours") or "N/A",
            "area_of_operation": app.get("area_of_operation") or [],
            "years_in_operation": app.get("years_in_operation") or 0,
            "delivery_capability": app.get("delivery_capability") or False,
            "products": app.get("products") or [],
            "specialty_items": app.get("specialty_items") or [],
            # Status Information
            "status": app.get("status") or "pending",
            "submitted_at": app.get("submitted_at"),
            "reviewed_at": app.get("reviewed_at"),
        })

    # Get summary statistics
    summary = get_report_summary(current_user)

    return {
        "total": len(report_data) if search else total,
        "skip": skip,
        "limit": limit,
        "vendors": report_data,
        "summary": summary
    }


def get_report_summary(current_user=Depends(get_current_user)):
    """Get summary statistics for vendor reports"""
    # Verify admin access
    user = db.users.find_one({"_id": current_user["_id"]})
    if user.get("role") not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Total approved vendors
    total_vendors = db.vendor_applications.count_documents({"status": "approved"})
    
    # Count by vendor type (goods_type)
    vendor_types_pipeline = [
        {"$match": {"status": "approved"}},
        {"$group": {"_id": "$goods_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    vendor_types = list(db.vendor_applications.aggregate(vendor_types_pipeline))
    
    # Count by area of operation
    areas_pipeline = [
        {"$match": {"status": "approved"}},
        {"$unwind": "$area_of_operation"},
        {"$group": {"_id": "$area_of_operation", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    areas = list(db.vendor_applications.aggregate(areas_pipeline))
    
    # Count by cart type
    cart_types_pipeline = [
        {"$match": {"status": "approved"}},
        {"$group": {"_id": "$cart_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    cart_types = list(db.vendor_applications.aggregate(cart_types_pipeline))

    return {
        "total_vendors": total_vendors,
        "by_vendor_type": [{"type": v["_id"] or "Unspecified", "count": v["count"]} for v in vendor_types],
        "by_area": [{"area": a["_id"] or "Unspecified", "count": a["count"]} for a in areas],
        "by_cart_type": [{"type": c["_id"] or "Unspecified", "count": c["count"]} for c in cart_types]
    }


def get_vendor_types(current_user=Depends(get_current_user)):
    """Get distinct vendor types for filtering"""
    user = db.users.find_one({"_id": current_user["_id"]})
    if user.get("role") not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    types = db.vendor_applications.distinct("goods_type", {"status": "approved"})
    return [t for t in types if t]


def get_operating_areas(current_user=Depends(get_current_user)):
    """Get distinct operating areas for filtering"""
    user = db.users.find_one({"_id": current_user["_id"]})
    if user.get("role") not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    pipeline = [
        {"$match": {"status": "approved"}},
        {"$unwind": "$area_of_operation"},
        {"$group": {"_id": "$area_of_operation"}},
        {"$sort": {"_id": 1}}
    ]
    areas = list(db.vendor_applications.aggregate(pipeline))
    return [a["_id"] for a in areas if a["_id"]]


def export_vendor_report(
    vendor_type: str = None,
    area_of_operation: str = None,
    current_user=Depends(get_current_user)
):
    """Export vendor report data for CSV/Excel generation"""
    user = db.users.find_one({"_id": current_user["_id"]})
    if user.get("role") not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Admin access required")

    query = {"status": "approved"}
    
    if vendor_type:
        query["goods_type"] = {"$regex": vendor_type, "$options": "i"}
    
    if area_of_operation:
        query["area_of_operation"] = {"$elemMatch": {"$regex": area_of_operation, "$options": "i"}}

    applications = list(db.vendor_applications.find(query).sort("submitted_at", -1))

    export_data = []
    for app in applications:
        vendor_user = db.users.find_one({"_id": app.get("user_id")})
        
        export_data.append({
            "Vendor Name": f"{vendor_user.get('firstname', '')} {vendor_user.get('lastname', '')}" if vendor_user else "Unknown",
            "Business Name": app.get("business_name") or "N/A",
            "Email": vendor_user.get("email") if vendor_user else "N/A",
            "Mobile Number": vendor_user.get("mobile_no") if vendor_user else "N/A",
            "Address": vendor_user.get("address") if vendor_user else "N/A",
            "Barangay": vendor_user.get("barangay") if vendor_user else "N/A",
            "Vendor Type": app.get("goods_type") or "N/A",
            "Cart Type": app.get("cart_type") or "N/A",
            "Operating Hours": app.get("operating_hours") or "N/A",
            "Operating Areas": ", ".join(app.get("area_of_operation") or []),
            "Years in Operation": app.get("years_in_operation") or 0,
            "Has Delivery": "Yes" if app.get("delivery_capability") else "No",
            "Status": app.get("status") or "pending",
            "Registration Date": app.get("submitted_at").strftime("%Y-%m-%d") if app.get("submitted_at") else "N/A"
        })

    return {
        "total": len(export_data),
        "data": export_data
    }
