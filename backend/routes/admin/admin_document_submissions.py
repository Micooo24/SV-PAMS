from fastapi import APIRouter, HTTPException, Depends
from controllers.admin.admin_document_submissions import (
    get_submission_by_id,
    get_all_submissions,
    delete_submission 
)
from utils.utils import get_current_user
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()



 # Route for getting single submission details of users for management
@router.get("/get-single/{submission_id}")
async def get_submission(
    submission_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get single submission details"""
    try:
        result = get_submission_by_id(submission_id, current_user)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {"submission": result["submission"]}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
# Admin Route to get all document submissions 
@router.get("/get-all")
async def admin_get_all_submissions():
    """Admin: Get all document submissions from all users"""
    try:
        result = get_all_submissions()
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {"submissions": result["submissions"]}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Admin fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
# Admin Route to delete a document submission
@router.delete("/delete/{submission_id}")
async def admin_delete_submission(submission_id: str):
    """Admin: Delete a document submission"""
    try:
        result = delete_submission(submission_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {"message": result["message"]}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Delete error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))