from fastapi import APIRouter, Depends, Query
from controllers.admin.admin_vendor_applications import (
    get_all_vendor_applications,
    get_application_detail,
    approve_application,
    reject_application,
    request_missing_documents,
)
from utils.utils import get_current_user
from pydantic import BaseModel

router = APIRouter()


class RejectRequest(BaseModel):
    rejection_reason: str


class MissingDocumentsRequest(BaseModel):
    missing_fields: list
    message: str


@router.get("/applications")
def list_applications(
    status: str = Query(None),
    skip: int = Query(0),
    limit: int = Query(50),
    current_user=Depends(get_current_user),
):
    """List all vendor applications"""
    return get_all_vendor_applications(status, skip, limit, current_user)


@router.get("/applications/{application_id}")
def detail_application(
    application_id: str,
    current_user=Depends(get_current_user),
):
    """Get detailed vendor application"""
    return get_application_detail(application_id, current_user)


@router.post("/applications/{application_id}/approve")
def approve_vendor_application(
    application_id: str,
    current_user=Depends(get_current_user),
):
    """Approve vendor application"""
    return approve_application(application_id, current_user)


@router.post("/applications/{application_id}/reject")
def reject_vendor_application(
    application_id: str,
    data: RejectRequest,
    current_user=Depends(get_current_user),
):
    """Reject vendor application"""
    return reject_application(application_id, data.rejection_reason, current_user)


@router.post("/applications/{application_id}/request-documents")
def request_missing_docs(
    application_id: str,
    data: MissingDocumentsRequest,
    current_user=Depends(get_current_user),
):
    """Request missing documents from vendor"""
    return request_missing_documents(
        application_id, data.missing_fields, data.message, current_user
    )
