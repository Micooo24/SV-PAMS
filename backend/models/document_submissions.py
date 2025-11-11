from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional
from enum import Enum
from bson import ObjectId

class SubmissionStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    needs_review = "needs_review"

class DocumentSubmission(BaseModel):
    user_id: ObjectId
    base_document_id: ObjectId
    base_document_title: str
    filename: str
    file_type: str
    file_url: str
    notes: Optional[str] = ""
    similarity_percentage: Optional[float] = None
    status: Optional[SubmissionStatus] = SubmissionStatus.pending
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True