from fastapi import HTTPException
from models.reports import Report
from typing import List
from pymongo.errors import PyMongoError
from config.db import db

reports_collection = db["reports"]

async def get_report_by_id(report_id: str) -> Report:
    report = await reports_collection.find_one({"_id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return Report(**report)

async def get_reports_by_cart_id(cart_id: str) -> List[Report]:
    reports = reports_collection.find({"cart_id": cart_id})
    return [Report(**r) async for r in reports]

async def get_all_reports() -> List[Report]:
    reports = reports_collection.find()
    return [Report(**r) async for r in reports]

async def create_report(report: Report) -> Report:
    try:
        await reports_collection.insert_one(report.dict())
        return report
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))

async def update_report(report_id: str, report_data: dict) -> Report:
    result = await reports_collection.update_one({"_id": report_id}, {"$set": report_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    report = await reports_collection.find_one({"_id": report_id})
    return Report(**report)

async def delete_report(report_id: str):
    result = await reports_collection.delete_one({"_id": report_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
