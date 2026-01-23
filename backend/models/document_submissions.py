# from pydantic import BaseModel, Field
# from datetime import datetime, timezone
# from typing import List, Optional, Dict, Any
# from enum import Enum
# from bson import ObjectId

# class SubmissionStatus(str, Enum):
#     pending = "pending"
#     approved = "approved"
#     rejected = "rejected"
#     needs_review = "needs_review"

# class DocumentSubmission(BaseModel):
#     user_id: ObjectId
    
#     # Modify to array fields 
#     filename: List[str]
#     file_type: List[str] # JPG, PNG OR PDF
#     file_url_original: List[str]  #  User's original uploaded image
#     file_url_processed: Optional[List[str]] = None  # User's image with bounding boxes via google cloud vision
    
    
#     status: SubmissionStatus = SubmissionStatus.pending
    
    
#     # Modify these fields later on
#     base_document_id: ObjectId
#     base_document_title: str
#     base_document_category: Optional[str] = "general" 
    
    
#     # Modify these fields for gemini verification and scikit confusion matrix
#     notes: Optional[str] = ""
#     similarity_percentage: Optional[float] = 0.0
#     comparison_details: Optional[Dict[str, float]] = Field(default_factory=dict)  #  Text, label, object, layout similarity
#     spatial_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict)  #  Block counts, word counts, etc.
#     bounding_boxes: Optional[Dict[str, Any]] = Field(default_factory=dict)  #  Bounding box data
#     submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     reviewed_at: Optional[datetime] = None
#     reviewed_by: Optional[ObjectId] = None
#     admin_notes: Optional[str] = None
    
    
#     class Config:
#         arbitrary_types_allowed = True
#         json_encoders = {
#             ObjectId: str,
#             datetime: lambda v: v.isoformat()
#         }

#update as of 1/24/2026 many things to clarify

from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from enum import Enum
from bson import ObjectId

class SubmissionStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    needs_review = "needs_review"

class DocumentSubmission(BaseModel):
    user_id: ObjectId
    
    # --- 1. FILE ARRAYS (Multiple Uploads) ---
    filename: List[str]
    file_type: List[str]
    file_url_original: List[str]
    
    # Stores the URL of the image with Green Boxes drawn on it
    file_url_processed: Optional[List[str]] = None 

    # --- 2. STATUS (The "Ground Truth" for Scikit) ---
    # When Admin changes this to 'approved' or 'rejected', 
    # this becomes your 'y_true'.
    status: SubmissionStatus = SubmissionStatus.pending

    # --- 3. BASE DOCUMENT INFO ---
    base_document_id: ObjectId
    base_document_title: str
    base_document_category: Optional[str] = "general" 

    # --- 4. GEMINI VERIFICATION (The "Why") ---
    # Stores the reasoning for EACH file.
    # Example: [{"file": "page1.jpg", "status": "VERIFIED", "reason": "Valid Header found"}, ...]
    gemini_details: List[Dict[str, Any]] = Field(default_factory=list)

    # --- 5. SCIKIT-LEARN METRICS (The "y_pred") ---
    # 1 = AI said Verified. 0 = AI said Rejected.
    # This allows you to generate the Confusion Matrix instantly.
    ai_prediction_label: int = 0 
    
    # Optional: Average confidence score from Gemini (if provided)
    similarity_percentage: float = 0.0

    # --- 6. VISUALIZATION ONLY ---
    # We keep this ONLY to draw boxes on the UI. No math calculations.
    # Must be a List because you have multiple files.
    bounding_boxes: List[Dict[str, Any]] = Field(default_factory=list) 

    # --- 7. METADATA ---
    notes: Optional[str] = ""
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