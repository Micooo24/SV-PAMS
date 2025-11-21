from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional, Dict, Any
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
    base_document_category: Optional[str] = "general"
    filename: str
    file_type: str
    file_url_original: str  #  User's original uploaded image
    file_url_processed: Optional[str] = None  # User's image with bounding boxes
    notes: Optional[str] = ""
    similarity_percentage: Optional[float] = 0.0
    status: SubmissionStatus = SubmissionStatus.pending
    comparison_details: Optional[Dict[str, float]] = Field(default_factory=dict)  #  Text, label, object, layout similarity
    spatial_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict)  #  Block counts, word counts, etc.
    bounding_boxes: Optional[Dict[str, Any]] = Field(default_factory=dict)  #  Bounding box data
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[ObjectId] = None
    admin_notes: Optional[str] = None
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }