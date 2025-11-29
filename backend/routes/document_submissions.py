from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Depends
from controllers.document_submissions import (
    submit_document,
    get_user_submissions,
    get_submission_by_id,
)
from utils.utils import get_current_user
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Route for user uploading document submissions

@router.post("/upload")
async def user_submit_document(
    file: UploadFile = File(...),
    base_document_id: str = Form(...),
    notes: str = Form(""),
    current_user: dict = Depends(get_current_user)
):
    """User submits document for comparison"""
    try:
        result = await submit_document(
            file=file,
            base_document_id=base_document_id,
            notes=notes,
            current_user=current_user
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "message": "Document submitted successfully",
            "submission": result["submission"]
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Submission error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Route for getting all submissions of authenticated user
@router.get("/my-uploads")
async def get_submissions(current_user: dict = Depends(get_current_user)):
    """Get all submissions by authenticated user"""
    try:
        result = get_user_submissions(current_user)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {"submissions": result["submissions"]}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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


