from config.db import db
from config.cloudinary_config import upload_file
from datetime import datetime
from bson import ObjectId
import logging
from fastapi import UploadFile
from typing import List
import numpy as np # Required for calculating average

from utils.document_comparison import compare_documents_with_vision
from models.document_submissions import DocumentSubmission, SubmissionStatus

logger = logging.getLogger(__name__)


#  Upload file accept image fomats and document formats
# async def submit_document(files: List[UploadFile], base_document_id: str, notes: str, current_user: dict):
#     """Submit multiple user documents for comparison with bounding box analysis"""
#     try:
#         user_id = current_user["_id"]
#         base_doc_oid = ObjectId(base_document_id)
#         user_oid = ObjectId(user_id)
        
#         # Verify user exists
#         user = db["users"].find_one({"_id": user_oid})
#         if not user:
#             return {"success": False, "error": "User not found"}
        
#         # Get base document
#         base_doc = db["base_documents"].find_one({"_id": base_doc_oid})
#         if not base_doc:
#             return {"success": False, "error": "Base document not found"}
        
#         # --- INITIALIZE LISTS TO STORE RESULTS ---
#         filenames = []
#         file_types = []
#         file_urls_original = []
#         file_urls_processed = []
        
#         all_similarities = []
#         all_comparison_details = []
#         all_spatial_analysis = []
#         all_bounding_boxes = []

#         # --- LOOP THROUGH EACH FILE ---
#         logger.info(f"Processing {len(files)} files for user {user['email']}...")

#         for file in files:
#             # 1. Capture Metadata
#             filenames.append(file.filename)
#             file_types.append(file.content_type)

#             # 2. Upload SINGLE file to Cloudinary
#             # We call upload_file() for the current item in the loop
#             logger.info(f"Uploading file: {file.filename}")
#             try:
#                 uploaded_url = upload_file(file, folder="user_submissions")
#                 file_urls_original.append(uploaded_url)
#             except Exception as upload_error:
#                 logger.error(f"Upload failed for {file.filename}: {upload_error}")
#                 return {"success": False, "error": f"Upload failed for {file.filename}"}

#             # 3. Compare SINGLE file using Vision API
#             logger.info(f"Comparing {file.filename} with Vision API...")
#             comparison_result = await compare_documents_with_vision(
#                 base_url=base_doc["file_url"],
#                 user_url=uploaded_url
#             )

#             # 4. Append Results to Lists
#             if comparison_result["success"]:
#                 all_similarities.append(comparison_result["similarity_percentage"])
#                 all_comparison_details.append(comparison_result["details"])
#                 all_spatial_analysis.append(comparison_result.get("spatial_analysis", {}))
#                 all_bounding_boxes.append(comparison_result.get("bounding_boxes", {}))
                
#                 # Get the processed image URL (if exists)
#                 processed_url = comparison_result.get("processed_images", {}).get("user_processed_url")
#                 file_urls_processed.append(processed_url)
#             else:
#                 # Handle failure for this specific file (0 score)
#                 logger.warning(f"Comparison failed for {file.filename}: {comparison_result.get('error')}")
#                 all_similarities.append(0.0)
#                 all_comparison_details.append({})
#                 all_spatial_analysis.append({})
#                 all_bounding_boxes.append({})
#                 file_urls_processed.append(None)

#         # --- CALCULATE FINAL STATUS ---
#         # We use the average of all pages/files to determine if the submission is approved
#         avg_similarity = float(np.mean(all_similarities)) if all_similarities else 0.0

#         if avg_similarity >= 90:
#             status = SubmissionStatus.approved
#         elif avg_similarity >= 70:
#             status = SubmissionStatus.needs_review
#         else:
#             status = SubmissionStatus.rejected
        
#         # --- CREATE SUBMISSION OBJECT (Now using Lists) ---
#         submission = DocumentSubmission(
#             user_id=user_oid,
#             base_document_id=base_doc_oid,
#             base_document_title=base_doc["title"],
#             base_document_category=base_doc.get("category", "general"),
            
#             # These are now correctly passed as Lists
#             filename=filenames,
#             file_type=file_types,
#             file_url_original=file_urls_original,
#             file_url_processed=file_urls_processed,
            
#             notes=notes,
#             similarity_percentage=avg_similarity, # Average score
#             status=status,
            
#             # These fields now contain Lists of Dictionaries
#             comparison_details={
#                 "average_similarity": avg_similarity,
#                 "file_breakdown": all_comparison_details
#             },
#             spatial_analysis=all_spatial_analysis,
#             bounding_boxes=all_bounding_boxes,
            
#             submitted_at=datetime.now(),
#             reviewed_at=None,
#             reviewed_by=None,
#             admin_notes=None
#         )
        
#         # Insert into MongoDB
#         submission_dict = submission.dict(by_alias=True)
#         result = db["document_submissions"].insert_one(submission_dict)
        
#         logger.info(f"Document submitted: {status.value} ({avg_similarity}%)")
        
#         return {
#             "success": True,
#             "submission": {
#                 "_id": str(result.inserted_id),
#                 "user_email": user["email"],
#                 "filename": filenames,
#                 "file_count": len(files),
#                 "status": status.value,
#                 "similarity_percentage": avg_similarity
#             }
#         }
    
#     except Exception as e:
#         logger.error(f"Error submitting document: {str(e)}")
#         return {"success": False, "error": str(e)}


# 🧪 TEMPORARY TEST FUNCTION - Add this after the original submit_document
async def submit_document(files: List[UploadFile], base_document_id: str, notes: str, current_user: dict):
    """TEMPORARY: Test file upload with mock Vision API results"""
    try:
        user_id = current_user["_id"]
        base_doc_oid = ObjectId(base_document_id)
        user_oid = ObjectId(user_id)
        
        # Verify user exists
        user = db["users"].find_one({"_id": user_oid})
        if not user:
            return {"success": False, "error": "User not found"}
        
        # Get base document
        base_doc = db["base_documents"].find_one({"_id": base_doc_oid})
        if not base_doc:
            return {"success": False, "error": "Base document not found"}
        
        # --- INITIALIZE LISTS TO STORE RESULTS ---
        filenames = []
        file_types = []
        file_urls_original = []

        # --- LOOP THROUGH EACH FILE ---
        logger.info(f"🧪 TEST MODE: Processing {len(files)} files for user {user['email']}...")

        for index, file in enumerate(files):
            # 1. Capture Metadata
            filenames.append(file.filename)
            file_types.append(file.content_type)
            
            logger.info(f"📄 File {index + 1}/{len(files)}: {file.filename} ({file.content_type})")

            # 2. Upload SINGLE file to Cloudinary
            logger.info(f"☁️ Uploading file: {file.filename}")
            try:
                uploaded_url = upload_file(file, folder="user_submissions")
                file_urls_original.append(uploaded_url)
                logger.info(f"✅ Upload successful: {uploaded_url}")
            except Exception as upload_error:
                logger.error(f"❌ Upload failed for {file.filename}: {upload_error}")
                return {"success": False, "error": f"Upload failed for {file.filename}"}

        # --- CREATE SUBMISSION OBJECT (Minimal test version) ---
        submission = DocumentSubmission(
            user_id=user_oid,
            base_document_id=base_doc_oid,
            base_document_title=base_doc["title"],
            base_document_category=base_doc.get("category", "general"),
            
            filename=filenames,
            file_type=file_types,
            file_url_original=file_urls_original,
            file_url_processed=[],  # Empty list
            
            notes=notes or "",  # Empty string if None
            similarity_percentage=0.0,  # Default 0.0
            status=SubmissionStatus.needs_review,  # Default status
            
            comparison_details={},  # Empty dict
            spatial_analysis={},  # Empty dict
            bounding_boxes={},  # Empty dict
            
            submitted_at=datetime.now(),
            reviewed_at=None,
            reviewed_by=None,
            admin_notes=""  # Empty string
        )
        
        # Insert into MongoDB
        submission_dict = submission.dict(by_alias=True)
        result = db["document_submissions"].insert_one(submission_dict)
        
        logger.info(f"✅ TEST SUBMISSION COMPLETE (minimal mode)")
        
        return {
            "success": True,
            "test_mode": True,
            "submission": {
                "_id": str(result.inserted_id),
                "user_email": user["email"],
                "filenames": filenames,
                "file_types": file_types,
                "file_count": len(files),
                "file_urls": file_urls_original,
                "status": SubmissionStatus.needs_review.value,
                "similarity_percentage": 0.0
            }
        }
    
    except Exception as e:
        logger.error(f"❌ TEST ERROR: {str(e)}")
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
