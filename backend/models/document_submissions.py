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

# #update as of 1/27/2026 many things to clarify

from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from enum import Enum
from bson import ObjectId

class SubmissionStatus(str, Enum):
    pending = "pending"       # Initial state. Waiting for Admin.
    approved = "approved"     # Admin confirmed VALID (True Positive)
    rejected = "rejected"     # Admin confirmed INVALID (True Negative)
    
    

class DocumentSubmission(BaseModel):
    user_id: ObjectId
    
    # --- 1. FILE ARRAYS (Multiple Uploads) ---
    filename: List[str]
    file_type: List[str]
    file_url_original: List[str]
    
    # Stores the URL of the image with Green Boxes drawn on it
    file_url_processed: List[Optional[str]] = []

    # --- 2. STATUS (The "Ground Truth" for Scikit) ---
    # When Admin changes this, it becomes your 'y_true'.
    status: SubmissionStatus = SubmissionStatus.pending

    # --- 3. BASE DOCUMENT INFO ---
    base_document_id: ObjectId
    base_document_title: str
    base_document_category: Optional[str] = "general" 
    base_document_file_url: Optional[str] = None

    # --- 4. GEMINI VERIFICATION (The "Why") ---
    # Detailed breakdown per file (optional)
    gemini_details: List[Dict[str, Any]] = Field(default_factory=list)
    
    #  NEW: Main explanation from Gemini for the overall decision
    gemini_reason: Optional[str] = ""

    # --- 5. SCIKIT-LEARN METRICS (The "y_pred" & "y_score") ---
    
    # THE LABEL (0 or 1): The AI's final "Pass/Fail" decision.
    # Used for Confusion Matrix (Precision/Recall).
    ai_prediction_label: int = 0 
    
    # THE SCORE (0.0 - 1.0): The AI's certainty level.
    # CRITICAL for ROC-AUC Curves. 
    # (e.g., 0.95 = Definite Yes, 0.55 = Unsure, 0.10 = Definite No)
    ai_confidence_score: float = 0.0

    # Legacy field (optional to keep if you use it for UI display)
    similarity_percentage: float = 0.0

    # --- 6. VISUALIZATION ONLY (Cloud Vision) ---
    # We keep this ONLY to draw boxes on the UI. No math calculations.
    bounding_boxes: List[Dict[str, Any]] = Field(default_factory=list) 

    # --- 7. METADATA ---
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Optional admin review fields
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[ObjectId] = None
    admin_notes: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }