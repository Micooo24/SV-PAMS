from fastapi import APIRouter, Depends, Query
from controllers.admin.admin_vendor_reports import (
    get_vendor_report,
    get_report_summary,
    get_vendor_types,
    get_operating_areas,
    export_vendor_report
)
from utils.utils import get_current_user

router = APIRouter()


@router.get("/reports")
def list_vendor_reports(
    vendor_type: str = Query(None, description="Filter by vendor type (goods_type)"),
    area_of_operation: str = Query(None, description="Filter by operating area"),
    status: str = Query(None, description="Filter by status"),
    search: str = Query(None, description="Search by vendor name or business name"),
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(50, description="Number of records to return"),
    current_user=Depends(get_current_user),
):
    """Get comprehensive vendor report with filtering options"""
    return get_vendor_report(
        vendor_type=vendor_type,
        area_of_operation=area_of_operation,
        status=status,
        search=search,
        skip=skip,
        limit=limit,
        current_user=current_user
    )


@router.get("/reports/summary")
def vendor_report_summary(
    current_user=Depends(get_current_user),
):
    """Get summary statistics for vendor reports"""
    return get_report_summary(current_user)


@router.get("/reports/vendor-types")
def list_vendor_types(
    current_user=Depends(get_current_user),
):
    """Get distinct vendor types for filtering"""
    return get_vendor_types(current_user)


@router.get("/reports/operating-areas")
def list_operating_areas(
    current_user=Depends(get_current_user),
):
    """Get distinct operating areas for filtering"""
    return get_operating_areas(current_user)


@router.get("/reports/export")
def export_reports(
    vendor_type: str = Query(None, description="Filter by vendor type"),
    area_of_operation: str = Query(None, description="Filter by operating area"),
    current_user=Depends(get_current_user),
):
    """Export vendor report data for CSV/Excel generation"""
    return export_vendor_report(
        vendor_type=vendor_type,
        area_of_operation=area_of_operation,
        current_user=current_user
    )
