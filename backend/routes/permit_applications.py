from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Depends, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import date

from controllers.permit_applications import (
    submit_permit_application,
    get_user_applications,
    get_all_applications,
    update_application_status,
    get_application_by_id,
    delete_document_from_application
)
from models.permit_applications import (
    PermitApplication,
    PermitApplicationResponse,
    ApplicationStatus,
    BusinessType
)

# Assuming you have authentication middleware
# from middleware.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/api/permit-applications", tags=["Permit Applications"])

@router.post("/submit", response_model=dict, status_code=status.HTTP_201_CREATED)
async def submit_application(
    business_name: str = Form(...),
    business_type: BusinessType = Form(...),
    business_description: str = Form(...),
    business_address: str = Form(...),
    business_barangay: str = Form(...),
    business_zip_code: int = Form(...),
    contact_person: str = Form(...),
    contact_email: str = Form(...),
    contact_mobile: str = Form(...),
    expected_start_date: date = Form(...),
    estimated_daily_customers: int = Form(...),
    business_hours_start: str = Form(...),
    business_hours_end: str = Form(...),
    equipment_list: str = Form(...),
    expected_end_date: Optional[date] = Form(None),
    notes: Optional[str] = Form(None),
    documents: Optional[List[UploadFile]] = File(None),
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth dependency
):
    """Submit a new permit application"""
    try:
        result = await submit_permit_application(
            user_id=user_id,
            business_name=business_name,
            business_type=business_type,
            business_description=business_description,
            business_address=business_address,
            business_barangay=business_barangay,
            business_zip_code=business_zip_code,
            contact_person=contact_person,
            contact_email=contact_email,
            contact_mobile=contact_mobile,
            expected_start_date=expected_start_date,
            estimated_daily_customers=estimated_daily_customers,
            business_hours_start=business_hours_start,
            business_hours_end=business_hours_end,
            equipment_list=equipment_list,
            expected_end_date=expected_end_date,
            notes=notes,
            documents=documents
        )
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"message": "Application submitted successfully", "data": result}
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-applications", response_model=List[dict])
async def get_my_applications(
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth dependency
):
    """Get current user's permit applications"""
    try:
        applications = await get_user_applications(user_id)
        return applications
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all", response_model=List[dict])
async def get_all_permit_applications(
    status_filter: Optional[ApplicationStatus] = None,
    admin_user: str = Depends(lambda: "admin_user_id")  # Replace with actual admin auth dependency
):
    """Get all permit applications (admin only)"""
    try:
        applications = await get_all_applications(status_filter)
        return applications
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{application_id}", response_model=dict)
async def get_application_details(
    application_id: str,
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth dependency
):
    """Get specific application by ID"""
    try:
        application = await get_application_by_id(application_id)
        
        # Check if user owns the application or is admin
        # This should be implemented based on your auth system
        # if application["user_id"] != user_id and not is_admin(user_id):
        #     raise HTTPException(status_code=403, detail="Access denied")
        
        return application
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{application_id}/status", response_model=dict)
async def update_permit_status(
    application_id: str,
    status_update: ApplicationStatus,
    rejection_reason: Optional[str] = None,
    admin_user: str = Depends(lambda: "admin_user_id")  # Replace with actual admin auth dependency
):
    """Update application status (admin only)"""
    try:
        updated_application = await update_application_status(
            application_id=application_id,
            status=status_update,
            reviewer_id=admin_user,
            rejection_reason=rejection_reason
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Application status updated successfully", "data": updated_application}
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{application_id}/documents/{document_public_id}")
async def delete_application_document(
    application_id: str,
    document_public_id: str,
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth dependency
):
    """Delete a document from an application"""
    try:
        result = await delete_document_from_application(
            application_id=application_id,
            document_public_id=document_public_id,
            user_id=user_id
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/options", response_model=List[str])
async def get_status_options():
    """Get available application status options"""
    return [status.value for status in ApplicationStatus]

@router.get("/business-types/options", response_model=List[str])
async def get_business_type_options():
    """Get available business type options"""
    return [business_type.value for business_type in BusinessType]

# Additional endpoints for better functionality
@router.get("/statistics/summary")
async def get_application_statistics(
    admin_user: str = Depends(lambda: "admin_user_id")  # Replace with actual admin auth dependency
):
    """Get application statistics (admin only)"""
    try:
        # This would need to be implemented in the controller
        stats = {
            "total_applications": 0,
            "pending_applications": 0,
            "approved_applications": 0,
            "rejected_applications": 0,
            "under_review_applications": 0
        }
        # Implement actual statistics logic in controller
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
