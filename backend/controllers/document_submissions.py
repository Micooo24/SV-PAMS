from config.db import db
from config.cloudinary_config import upload_image
from datetime import datetime
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

async def submit_document(file, base_document_id: str, notes: str, current_user: dict):
    """Submit user document for comparison"""
    try:
        # Get user_id from authenticated user
        user_id = current_user["_id"]
        
        # Convert string IDs to ObjectId
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
        user_file_url = upload_image(file, folder="user_submissions")
        
        # Simple comparison logic (you can enhance this later)
        similarity = 85.0  # Placeholder - implement your comparison algorithm
        
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
            "submitted_at": datetime.now()
        }
        
        # Insert into MongoDB
        result = db["document_submissions"].insert_one(submission_dict)
        
        logger.info(f"Document submitted by user {user['email']}: {status}")
        
        return {
            "success": True,
            "submission": {
                "_id": str(result.inserted_id),
                "user_email": user["email"],
                "user_name": f"{user['firstname']} {user['lastname']}",
                "status": status,
                "similarity_percentage": similarity,
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
        
        # Find all submissions for this user
        submissions = list(
            db["document_submissions"]
            .find({"user_id": user_oid})
            .sort("submitted_at", -1)  # Latest first
        )
        
        # Convert ObjectIds to strings for JSON response
        for sub in submissions:
            sub["_id"] = str(sub["_id"])
            sub["user_id"] = str(sub["user_id"])
            sub["base_document_id"] = str(sub["base_document_id"])
            sub["submitted_at"] = sub["submitted_at"].isoformat()
        
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
            "user_id": user_oid  # Ensure user owns this submission
        })
        
        if not submission:
            return {
                "success": False,
                "error": "Submission not found or you don't have permission to view it"
            }
        
        # Convert ObjectIds to strings
        submission["_id"] = str(submission["_id"])
        submission["user_id"] = str(submission["user_id"])
        submission["base_document_id"] = str(submission["base_document_id"])
        submission["submitted_at"] = submission["submitted_at"].isoformat()
        
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