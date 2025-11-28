from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from typing import Optional
from controllers.admin.admin_base_document import (
    upload_base_document,
    get_all_base_documents,
    get_base_document_by_id,
    update_base_document_by_id,
    delete_base_document_by_id
)
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload")
async def admin_base_document_upload(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form("")
):
    """Admin uploads base document via Postman"""
    try:
        result = await upload_base_document(
            file=file,
            title=title,
            category=category,
            description=description
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "message": "Base document uploaded successfully",
            "document": result["document"]
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get-all")
async def admin_get_base_documents(category: str = None):
    """Admin gets all base documents"""
    try:
        result = get_all_base_documents(category=category)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {"documents": result["documents"]}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get-single/{document_id}")
async def admin_get_base_document(document_id: str):
    """Admin gets single base document"""
    try:
        result = get_base_document_by_id(document_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {"document": result["document"]}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{document_id}")
async def admin_update_base_document(
    document_id: str,
    file: Optional[UploadFile] = File(None),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None)
):
    """Admin updates base documents"""
    try:
        result = update_base_document_by_id(
            document_id=document_id,
            file=file,
            title=title,
            category=category,
            description=description,
            is_active=is_active
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "message": result.get("message", "Document updated successfully"),
            "document": result["document"]
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Update error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    

@router.delete("/delete/{document_id}")
async def admin_delete_base_document(document_id: str):
    """Admin deletes base document by ID"""
    try:
        result = delete_base_document_by_id(document_id)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "message": result.get("message", "Document deleted successfully")
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Delete error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# User endpoints (if users also need to view base documents)
# @router.get("/base-documents")
# async def get_base_documents_public(category: str = None):
#     """Users get all active base documents (public)"""
#     try:
#         result = get_all_base_documents(category=category)
        
#         if not result["success"]:
#             raise HTTPException(status_code=500, detail=result["error"])
        
#         return {"documents": result["documents"]}
    
#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         logger.error(f"Fetch error: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))