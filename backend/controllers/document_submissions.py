from config.db import db
from config.cloudinary_config import upload_image
from datetime import datetime
from bson import ObjectId
import logging

from utils.document_comparison import compare_documents_with_vision

logger = logging.getLogger(__name__)


async def submit_document(file, base_document_id: str, notes: str, current_user: dict):
    """Submit user document for comparison"""
    try:
        user_id = current_user["_id"]
        base_doc_oid = ObjectId(base_document_id)
        user_oid = ObjectId(user_id)
        
        # Verify user exists
        user = db["users"].find_one({"_id": user_oid})
        if not user:
            return {
                "success": False,
                "error": "User not found"
            }
        
        # Get base document
        base_doc = db["base_documents"].find_one({"_id": base_doc_oid})
        if not base_doc:
            return {
                "success": False,
                "error": "Base document not found"
            }
        
        # Upload user file to Cloudinary
        logger.info(f"Uploading user document to Cloudinary...")
        user_file_url = upload_image(file, folder="user_submissions")
        logger.info(f"User document uploaded: {user_file_url}")
        
        # USE GOOGLE VISION API FOR COMPARISON
        logger.info(f"Starting document comparison with Google Vision API...")
        comparison_result = await compare_documents_with_vision(
            base_url=base_doc["file_url"],
            user_url=user_file_url
        )
        
        # Handle comparison failure
        if not comparison_result["success"]:
            logger.error(f"Comparison failed: {comparison_result.get('error')}")
            similarity = 0.0
            comparison_details = {
                "text_similarity": 0.0,
                "label_similarity": 0.0,
                "object_similarity": 0.0
            }
        else:
            similarity = comparison_result["similarity_percentage"]
            comparison_details = comparison_result["details"]
            logger.info(f"Comparison successful: {similarity}%")
        
        # Determine status based on similarity
        if similarity >= 90:
            status = "approved"
        elif similarity >= 70:
            status = "needs_review"
        else:
            status = "rejected"
        
        # Create submission document
        submission_dict = {
            "user_id": user_oid,
            "base_document_id": base_doc_oid,
            "base_document_title": base_doc["title"],
            "filename": file.filename,
            "file_type": file.content_type,
            "file_url": user_file_url,
            "notes": notes,
            "similarity_percentage": similarity,
            "status": status,
            "comparison_details": comparison_details,  # Only 3 metrics now
            "submitted_at": datetime.now()
        }
        
        # Insert into MongoDB
        result = db["document_submissions"].insert_one(submission_dict)
        
        logger.info(f"Document submitted by user {user['email']}: {status} ({similarity}%)")
        
        return {
            "success": True,
            "submission": {
                "_id": str(result.inserted_id),
                "user_email": user["email"],
                "user_name": f"{user['firstname']} {user['lastname']}",
                "base_document_title": base_doc["title"],
                "filename": file.filename,
                "status": status,
                "similarity_percentage": similarity,
                "comparison_details": comparison_details,
                "submitted_at": submission_dict["submitted_at"].isoformat()
            }
        }
    
    except Exception as e:
        logger.error(f"Error submitting document: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


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
        
        for sub in submissions:
            sub["_id"] = str(sub["_id"])
            sub["user_id"] = str(sub["user_id"])
            sub["base_document_id"] = str(sub["base_document_id"])
            sub["submitted_at"] = sub["submitted_at"].isoformat()
        
        logger.info(f"Retrieved {len(submissions)} submissions for user")
        
        return {
            "success": True,
            "submissions": submissions
        }
    
    except Exception as e:
        logger.error(f"Error fetching submissions: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


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
        
        submission["_id"] = str(submission["_id"])
        submission["user_id"] = str(submission["user_id"])
        submission["base_document_id"] = str(submission["base_document_id"])
        submission["submitted_at"] = submission["submitted_at"].isoformat()
        
        logger.info(f"Retrieved submission {submission_id}")
        
        return {
            "success": True,
            "submission": submission
        }
    
    except Exception as e:
        logger.error(f"Error fetching submission: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }