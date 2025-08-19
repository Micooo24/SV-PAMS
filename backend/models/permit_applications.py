from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    REQUIRES_REVISION = "requires_revision"

class BusinessType(str, Enum):
    FOOD_VENDOR = "food_vendor"
    RETAIL = "retail"
    SERVICE = "service"
    MANUFACTURING = "manufacturing"
    OTHER = "other"

class DocumentInfo(BaseModel):
    url: str
    public_id: str
    original_filename: str
    file_type: str
    file_size: int
    upload_date: str

class PermitApplication(BaseModel):
    user_id: str
    business_name: str
    business_type: BusinessType
    business_description: str
    business_address: str
    business_barangay: str
    business_zip_code: int
    contact_person: str
    contact_email: str
    contact_mobile: str
    expected_start_date: date
    expected_end_date: Optional[date] = None
    estimated_daily_customers: int
    business_hours_start: str
    business_hours_end: str
    equipment_list: List[str]
    documents: Optional[List[DocumentInfo]] = []  # Detailed document information
    status: ApplicationStatus = ApplicationStatus.PENDING
    submission_date: datetime
    review_date: Optional[datetime] = None
    approval_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    reviewer_id: Optional[str] = None
    notes: Optional[str] = None
    
class PermitApplicationResponse(BaseModel):
    id: str
    user_id: str
    business_name: str
    business_type: BusinessType
    status: ApplicationStatus
    submission_date: datetime
    review_date: Optional[datetime] = None
    approval_date: Optional[datetime] = None
