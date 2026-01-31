from config.db import db
from config.cloudinary_config import upload_file, generate_signed_url
from datetime import datetime
from bson import ObjectId
import logging
from fastapi import UploadFile
from typing import List
import numpy as np # Required for calculating average

from utils.document_comparison import compare_documents_with_vision
from models.document_submissions import DocumentSubmission, SubmissionStatus
from utils.gemini_util import verify_document_with_gemini
from utils.cloud_vision_util import generate_visual_evidence

logger = logging.getLogger(__name__)


async def submit_document(files: List[UploadFile], base_document_id: str, notes: str, current_user: dict):
    """
    Submits documents with FULL AI processing (Gemini + Cloud Vision).
    Populates fields for Scikit-Learn (Confidence/Label) and UI (Bounding Boxes).
    """
    try:
        user_id = current_user["_id"]
        base_doc_oid = ObjectId(base_document_id)
        user_oid = ObjectId(user_id)
        
        # 1. Validation
        user = db["users"].find_one({"_id": user_oid})
        if not user:
            return {"success": False, "error": "User not found"}
        
        base_doc = db["base_documents"].find_one({"_id": base_doc_oid})
        if not base_doc:
            return {"success": False, "error": "Base document not found"}
        
        # --- INITIALIZE AGGREGATION LISTS ---
        filenames = []
        file_types = []
        file_urls_original = []   # Private URLs (DB)
        file_urls_processed = []  # Green Box Images (DB)
        bounding_boxes_list = []  # Raw Coordinates (DB)
        gemini_details_list = []  # Per-file AI analysis
        
        ai_scores = []
        ai_labels = []
        reasons = []

        logger.info(f"🚀 Processing {len(files)} files for user {user['email']}...")

        # --- LOOP THROUGH EACH FILE ---
        for index, file in enumerate(files):
            filenames.append(file.filename)
            file_types.append(file.content_type)
            
            # A. Upload Original (Private)
            try:
                uploaded_url = upload_file(file, folder="user_submissions")
                file_urls_original.append(uploaded_url)
            except Exception as e:
                return {"success": False, "error": f"Upload failed for {file.filename}: {str(e)}"}

            # B. PHASE A: Gemini Analysis (Logic & Scoring)
            # We pass the URL + Template Title to the AI
            gemini_result = verify_document_with_gemini(uploaded_url, base_doc["title"])
            
            # Store details for this specific file
            gemini_details_list.append({
                "filename": file.filename,
                "label": gemini_result["ai_prediction_label"],
                "score": gemini_result["ai_confidence_score"],
                "reason": gemini_result["reason"]
            })
            
            # Collect for aggregation
            ai_labels.append(gemini_result["ai_prediction_label"])
            ai_scores.append(gemini_result["ai_confidence_score"])
            reasons.append(gemini_result["reason"])

            # C. PHASE C: Visual Evidence (Cloud Vision)
            # Generates the image with green bounding boxes
            vision_result = await generate_visual_evidence(uploaded_url)
            
            if vision_result["success"]:
                file_urls_processed.append(vision_result["file_url_processed"])
                bounding_boxes_list.append(vision_result["bounding_boxes"])
            else:
                # Fallback if vision fails (don't break the whole submission)
                file_urls_processed.append(None)
                bounding_boxes_list.append({})

        # --- AGGREGATE RESULTS (Root Level) ---
        # 1. Label: If ANY file is rejected (0), the whole batch is 0.
        root_prediction_label = 1 if all(l == 1 for l in ai_labels) else 0
        
        # 2. Score: Average confidence score of all files
        root_confidence_score = sum(ai_scores) / len(ai_scores) if ai_scores else 0.0
        
        # 3. Reason: Combine reasons into one string
        root_reason = "; ".join(reasons)

        # --- CREATE SUBMISSION OBJECT ---
        submission = DocumentSubmission(
            user_id=user_oid,
            base_document_id=base_doc_oid,
            base_document_title=base_doc["title"],
            base_document_category=base_doc.get("category", "general"),
            base_document_file_url=base_doc.get("file_url"),
            
            # File Data
            filename=filenames,
            file_type=file_types,
            file_url_original=file_urls_original,
            file_url_processed=file_urls_processed,
            
            # Phase A: Gemini Data (Logic)
            gemini_details=gemini_details_list,
            gemini_reason=root_reason,
            ai_prediction_label=root_prediction_label,
            ai_confidence_score=root_confidence_score,
            
            # Phase C: Vision Data (Visuals)
            bounding_boxes=bounding_boxes_list,
            
            # Phase B: Ground Truth (Waiting for Admin)
            status=SubmissionStatus.needs_review,
            
            # Metadata
            submitted_at=datetime.now(),
            admin_notes=notes or ""
        )
        
        # Insert into MongoDB
        submission_dict = submission.dict(by_alias=True)
        result = db["document_submissions"].insert_one(submission_dict)
        
        logger.info(f"✅ SUBMISSION COMPLETE: ID {result.inserted_id}")
        
        # --- PREPARE RESPONSE (Frontend) ---
        # Generate Signed URLs so the user can view the originals immediately
        signed_original_urls = [generate_signed_url(url) for url in file_urls_original]

        return {
            "success": True,
            "submission": {
                "_id": str(result.inserted_id),
                "user_email": user["email"],
                "filenames": filenames,
                "file_count": len(files),
                # Frontend Display Data
                "file_url_original": signed_original_urls,
                "file_url_processed": file_urls_processed,
                "status": SubmissionStatus.needs_review.value,
                "ai_prediction_label": root_prediction_label,
                "ai_confidence_score": root_confidence_score
            }
        }
    
    except Exception as e:
        logger.error(f"❌ SUBMISSION ERROR: {str(e)}")
        return {"success": False, "error": str(e)}






def get_user_submissions(current_user: dict):
    """Get all submissions by authenticated user"""
    try:
        user_id = current_user["_id"]
        user_oid = ObjectId(user_id)
        
        submissions = list(
            db["document_submissions"]
            .find({"user_id": user_oid})
            .sort("submitted_at", -1)
        )
        
        # Convert ObjectIds and datetimes to strings
        for sub in submissions:
            sub["_id"] = str(sub["_id"])
            sub["user_id"] = str(sub["user_id"])
            sub["base_document_id"] = str(sub["base_document_id"])
            sub["submitted_at"] = sub["submitted_at"].isoformat()
            if sub.get("reviewed_at"):
                sub["reviewed_at"] = sub["reviewed_at"].isoformat()
            if sub.get("reviewed_by"):
                sub["reviewed_by"] = str(sub["reviewed_by"])
        
        logger.info(f"Retrieved {len(submissions)} submissions for user")
        
        return {
            "success": True,
            "submissions": submissions
        }
    
    except Exception as e:
        logger.error(f"Error fetching submissions: {str(e)}")
        return {"success": False, "error": str(e)}


def get_submission_by_id(submission_id: str, current_user: dict):
    """Get single submission details (only if it belongs to user)"""
    try:
        user_id = current_user["_id"]
        user_oid = ObjectId(user_id)
        
        submission = db["document_submissions"].find_one({
            "_id": ObjectId(submission_id),
            "user_id": user_oid
        })
        
        if not submission:
            return {
                "success": False,
                "error": "Submission not found or you don't have permission to view it"
            }
        
        # Convert ObjectIds and datetimes to strings
        submission["_id"] = str(submission["_id"])
        submission["user_id"] = str(submission["user_id"])
        submission["base_document_id"] = str(submission["base_document_id"])
        submission["submitted_at"] = submission["submitted_at"].isoformat()
        if submission.get("reviewed_at"):
            submission["reviewed_at"] = submission["reviewed_at"].isoformat()
        if submission.get("reviewed_by"):
            submission["reviewed_by"] = str(submission["reviewed_by"])
        
        logger.info(f"Retrieved submission {submission_id}")
        
        return {
            "success": True,
            "submission": submission
        }
    
    except Exception as e:
        logger.error(f"Error fetching submission: {str(e)}")
        return {"success": False, "error": str(e)}
