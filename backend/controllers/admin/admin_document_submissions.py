from config.db import db
from bson import ObjectId
import logging


logger = logging.getLogger(__name__)

# For managing each user document submission (admin)
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

# Get all submissions (admin)
def get_all_submissions():
    """Admin: Get all document submissions from all users"""
    try:
        submissions = list(
            db["document_submissions"]
            .find({})
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
        
        logger.info(f"Retrieved {len(submissions)} total submissions")
        
        return {
            "success": True,
            "submissions": submissions
        }
    
    except Exception as e:
        logger.error(f"Error fetching all submissions: {str(e)}")
        return {"success": False, "error": str(e)}


# Delete submission (admin)
def delete_submission(submission_id: str):
    """Admin: Delete a document submission"""
    try:
        submission = db["document_submissions"].find_one({
            "_id": ObjectId(submission_id)
        })
        
        if not submission:
            return {
                "success": False,
                "error": "Submission not found"
            }
        
        # Delete the submission
        result = db["document_submissions"].delete_one({
            "_id": ObjectId(submission_id)
        })
        
        if result.deleted_count == 0:
            return {
                "success": False,
                "error": "Failed to delete submission"
            }
        
        logger.info(f"Deleted submission {submission_id}")
        
        return {
            "success": True,
            "message": "Submission deleted successfully"
        }
    
    except Exception as e:
        logger.error(f"Error deleting submission: {str(e)}")
        return {"success": False, "error": str(e)}