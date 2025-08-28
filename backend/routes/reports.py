from fastapi import APIRouter, HTTPException, Body
from typing import List
from models.reports import Report
from controllers.reports import (
    get_report_by_id,
    get_reports_by_cart_id,
    get_all_reports,
    create_report,
    update_report,
    delete_report
)

router = APIRouter()

@router.get("/reports", response_model=List[Report])
async def read_reports():
    return get_all_reports()

@router.get("/reports/{report_id}", response_model=Report)
async def read_report(report_id: str):
    return get_report_by_id(report_id)

@router.get("/reports/cart/{cart_id}", response_model=List[Report])
async def read_reports_by_cart(cart_id: str):
    return get_reports_by_cart_id(cart_id)

@router.post("/reports", response_model=Report)
async def add_report(report: Report = Body(...)):
    return create_report(report)

@router.put("/reports/{report_id}", response_model=Report)
async def edit_report(report_id: str, report_data: dict = Body(...)):
    return update_report(report_id, report_data)

@router.delete("/reports/{report_id}")
async def remove_report(report_id: str):
    delete_report(report_id)
    return {"message": "Report deleted successfully"}
