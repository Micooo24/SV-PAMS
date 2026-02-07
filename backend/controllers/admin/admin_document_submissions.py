from config.db import db
from bson import ObjectId
import logging
from datetime import datetime, timezone
from utils.notification import send_notification

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
        
        # Handle both ObjectId and email formats
        if submission.get("reviewed_by"):
            reviewed_by = submission["reviewed_by"]
            # Check if it's already an email (string with @)
            if isinstance(reviewed_by, str) and "@" in reviewed_by:
                submission["reviewed_by"] = reviewed_by
            # Otherwise, try to convert ObjectId to email
            else:
                try:
                    admin = db["users"].find_one({"_id": ObjectId(reviewed_by)})
                    submission["reviewed_by"] = admin.get("email", str(reviewed_by)) if admin else str(reviewed_by)
                except Exception:
                    submission["reviewed_by"] = str(reviewed_by)
        
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
            
            # Handle both ObjectId and email formats
            if sub.get("reviewed_by"):
                reviewed_by = sub["reviewed_by"]
                # Check if it's already an email (string with @)
                if isinstance(reviewed_by, str) and "@" in reviewed_by:
                    sub["reviewed_by"] = reviewed_by
                # Otherwise, try to convert ObjectId to email
                else:
                    try:
                        admin = db["users"].find_one({"_id": ObjectId(reviewed_by)})
                        sub["reviewed_by"] = admin.get("email", str(reviewed_by)) if admin else str(reviewed_by)
                    except Exception:
                        sub["reviewed_by"] = str(reviewed_by)
        
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

# Status Approve and Reject (admin)
def update_submission_status(submission_id: str, new_status: str, admin_notes: str, admin_user: dict):
    """Admin: Update the status of a document submission with required admin notes"""
    try:
        # Validate status
        valid_statuses = ["approved", "rejected", "needs_review"]
        if new_status not in valid_statuses:
            return {
                "success": False,
                "error": f"Invalid status. Valid statuses are: {valid_statuses}"
            }
        
        # Validate admin_notes is provided
        if not admin_notes or admin_notes.strip() == "":
            return {
                "success": False,
                "error": "Admin notes are required when updating submission status"
            }
        
        # Check if submission exists
        submission = db["document_submissions"].find_one({
            "_id": ObjectId(submission_id)
        })
        
        if not submission:
            return {
                "success": False,
                "error": "Submission not found"
            }
        
        # Get admin info
        admin_id = ObjectId(admin_user["_id"])
        admin_doc = db["users"].find_one({"_id": admin_id})
        
        if not admin_doc:
            return {
                "success": False,
                "error": "Admin user not found"
            }
        
        admin_email = admin_doc.get("email", "unknown@admin.com")
        
        # Prepare update data
        update_data = {
            "status": new_status,
            "reviewed_at": datetime.now(timezone.utc),
            "reviewed_by": admin_email,
            "admin_notes": admin_notes.strip()
        }
        
        # Update the submission
        result = db["document_submissions"].update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return {
                "success": False,
                "error": "Failed to update submission status"
            }
        
        logger.info(f"Submission {submission_id} updated to '{new_status}' by {admin_email}")
        
        # Send push notification to user
        user = db["users"].find_one({"_id": submission["user_id"]})
        
        if user and user.get("fcm_token"):
            # Get document title
            doc_title = submission.get("base_document_title", "Document")
            
            # Customize message based on status
            if new_status == "approved":
                title = "Document Approved ✅"
                body = f"Your '{doc_title}' has been approved!"
            elif new_status == "rejected":
                title = "Document Rejected ❌"
                body = f"Your '{doc_title}' was rejected. {admin_notes}"
            else:
                title = "Document Needs Review 🔍"
                body = f"Your '{doc_title}' needs review. {admin_notes}"
            
            # Send notification
            send_notification(
                fcm_token=user["fcm_token"],
                title=title,
                body=body
            )
            logger.info(f"Notification sent to user {user.get('email')}")
        else:
            logger.warning(f"No FCM token found for user {submission['user_id']}")
        
        return {
            "success": True,
            "message": f"Submission status updated to {new_status}",
            "updated_data": {
                "status": new_status,
                "reviewed_at": update_data["reviewed_at"].isoformat(),
                "reviewed_by": admin_email,
                "admin_notes": admin_notes.strip()
            }
        }
    
    except Exception as e:
        logger.error(f"Error updating submission status: {str(e)}")
        return {"success": False, "error": str(e)}