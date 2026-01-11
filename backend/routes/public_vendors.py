from fastapi import APIRouter, Query
from typing import Optional
from controllers.public_vendors import (
    get_approved_vendors,
    get_vendor_detail,
    get_vendor_categories,
)

router = APIRouter()


@router.get("/categories")
def list_vendor_categories():
    """Get all vendor categories (goods types)"""
    return get_vendor_categories()


@router.get("/list")
def list_vendors(
    goods_type: Optional[str] = Query(None, description="Filter by goods type"),
    delivery_capable: Optional[bool] = Query(None, description="Filter by delivery capability"),
    barangay: Optional[str] = Query(None, description="Filter by barangay"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """Get approved vendors with filters (public access)"""
    return get_approved_vendors(goods_type, delivery_capable, barangay, skip, limit)


@router.get("/{vendor_id}")
def get_vendor(vendor_id: str):
    """Get vendor details (public access)"""
    return get_vendor_detail(vendor_id)
