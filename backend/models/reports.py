#Lei
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ComplianceCheck(BaseModel):
    is_compliant: bool
    confidence: float
    violations: Optional[List[str]] = []

class Report(BaseModel):
    cart_id: str           # Reference to Vendors Collection
    reporter_user_id: str  # Reference to Users Collection
    image_url: str
    report_date: datetime = Field(default_factory=datetime.utcnow)
    compliance_check: ComplianceCheck
    feedback: Optional[str] = None
    status: str            # pending_review, approved, resolved

    class Config:
        arbitrary_types_allowed = True
  
