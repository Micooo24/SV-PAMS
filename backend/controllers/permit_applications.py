from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional

# MongoDB
from config.db import db

# Cloudinary
import cloudinary.uploader
import config.cloudinary_config

# Logging
import logging
from bson import ObjectId
from datetime import datetime, date
from models.permit_applications import PermitApplication, ApplicationStatus, BusinessType, PermitApplicationResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Helper function to validate document format
def validate_document_format(file: UploadFile) -> bool:
    """Validate if uploaded file is PDF or JPG format"""
    allowed_types = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    return file.content_type in allowed_types

# Submit Permit Application
async def submit_permit_application(
    user_id: str,
    business_name: str,
    business_type: BusinessType,
    business_description: str,
    business_address: str,
    business_barangay: str,
    business_zip_code: int,
    contact_person: str,
    contact_email: str,
    contact_mobile: str,
    expected_start_date: date,
    estimated_daily_customers: int,
    business_hours_start: str,
    business_hours_end: str,
    equipment_list: str,  # Comma-separated string
    expected_end_date: Optional[date] = None,
    notes: Optional[str] = None,
    documents: List[UploadFile] = None
):
    try:
        # Verify user exists and is a vendor
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.get("role") != "vendor":
            raise HTTPException(status_code=403, detail="Only vendors can submit permit applications")
        
        # Check for existing pending application
        existing_app = db["permit_applications"].find_one({
            "user_id": user_id,
            "status": {"$in": ["pending", "under_review", "requires_revision"]}
        })
        if existing_app:
            raise HTTPException(status_code=400, detail="You already have a pending permit application")
        
        # Upload documents to Cloudinary with validation
        document_urls = []
        if documents:
            for doc in documents:
                # Validate document format
                if not validate_document_format(doc):
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Invalid file format for {doc.filename}. Only PDF, JPG, JPEG, and PNG files are allowed."
                    )
                
                # Check file size (limit to 10MB)
                if doc.size and doc.size > 10 * 1024 * 1024:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File {doc.filename} is too large. Maximum file size is 10MB."
                    )
                
                try:
                    # Upload to Cloudinary with specific settings for documents
                    upload_params = {
                        "folder": "permit_documents",
                        "resource_type": "auto",
                        "use_filename": True,
                        "unique_filename": True,
                        "overwrite": False
                    }
                    
                    # For PDF files, add specific parameters
                    if doc.content_type == "application/pdf":
                        upload_params.update({
                            "format": "pdf",
                            "pages": True  # Generate thumbnails for PDF pages
                        })
                    
                    result = cloudinary.uploader.upload(doc.file, **upload_params)
                    
                    # Store document info with metadata
                    document_info = {
                        "url": result.get("secure_url"),
                        "public_id": result.get("public_id"),
                        "original_filename": doc.filename,
                        "file_type": doc.content_type,
                        "file_size": result.get("bytes"),
                        "upload_date": datetime.now().isoformat()
                    }
                    
                    document_urls.append(document_info)
                    
                except Exception as e:
                    logger.error(f"Document upload failed for {doc.filename}: {str(e)}")
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Document upload failed for {doc.filename}: {str(e)}"
                    )
        
        # Parse equipment list
        equipment_array = [item.strip() for item in equipment_list.split(",") if item.strip()]
        
        # Create application document
        application_dict = {
            "user_id": user_id,
            "business_name": business_name,
            "business_type": business_type,
            "business_description": business_description,
            "business_address": business_address,
            "business_barangay": business_barangay,
            "business_zip_code": business_zip_code,
            "contact_person": contact_person,
            "contact_email": contact_email,
            "contact_mobile": contact_mobile,
            "expected_start_date": expected_start_date.strftime("%Y-%m-%d"),
            "expected_end_date": expected_end_date.strftime("%Y-%m-%d") if expected_end_date else None,
            "estimated_daily_customers": estimated_daily_customers,
            "business_hours_start": business_hours_start,
            "business_hours_end": business_hours_end,
            "equipment_list": equipment_array,
            "documents": document_urls,
            "status": ApplicationStatus.PENDING,
            "submission_date": datetime.now().isoformat(),
            "notes": notes
        }
        
        inserted_application = db["permit_applications"].insert_one(application_dict)
        application_dict["_id"] = str(inserted_application.inserted_id)
        
        return application_dict
        
    except HTTPException as e:
        logger.error(f"HTTPException: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Get user's permit applications
async def get_user_applications(user_id: str):
    try:
        applications = list(db["permit_applications"].find({"user_id": user_id}))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            
        return applications
        
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Get all permit applications (admin only)
async def get_all_applications(status: Optional[ApplicationStatus] = None):
    try:
        query = {}
        if status:
            query["status"] = status
            
        applications = list(db["permit_applications"].find(query))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            
        return applications
        
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Update application status (admin only)
async def update_application_status(
    application_id: str,
    status: ApplicationStatus,
    reviewer_id: str,
    rejection_reason: Optional[str] = None
):
    try:
        update_data = {
            "status": status,
            "reviewer_id": reviewer_id,
            "review_date": datetime.now().isoformat()
        }
        
        if status == ApplicationStatus.APPROVED:
            update_data["approval_date"] = datetime.now().isoformat()
        elif status == ApplicationStatus.REJECTED and rejection_reason:
            update_data["rejection_reason"] = rejection_reason
            
        result = db["permit_applications"].update_one(
            {"_id": ObjectId(application_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
            
        updated_app = db["permit_applications"].find_one({"_id": ObjectId(application_id)})
        updated_app["_id"] = str(updated_app["_id"])
        
        return updated_app
        
    except HTTPException as e:
        logger.error(f"HTTPException: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Get single application by ID
async def get_application_by_id(application_id: str):
    try:
        application = db["permit_applications"].find_one({"_id": ObjectId(application_id)})
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
            
        application["_id"] = str(application["_id"])
        return application
        
    except HTTPException as e:
        logger.error(f"HTTPException: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Delete document from application
async def delete_document_from_application(application_id: str, document_public_id: str, user_id: str):
    try:
        # Verify application exists and belongs to user
        application = db["permit_applications"].find_one({
            "_id": ObjectId(application_id),
            "user_id": user_id
        })
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Check if application can be modified
        if application.get("status") not in ["pending", "requires_revision"]:
            raise HTTPException(status_code=400, detail="Cannot modify documents for this application")
        
        # Find and remove document from array
        documents = application.get("documents", [])
        updated_documents = [doc for doc in documents if doc.get("public_id") != document_public_id]
        
        if len(updated_documents) == len(documents):
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete from Cloudinary
        try:
            cloudinary.uploader.destroy(document_public_id, resource_type="auto")
        except Exception as e:
            logger.warning(f"Failed to delete document from Cloudinary: {str(e)}")
        
        # Update application in database
        db["permit_applications"].update_one(
            {"_id": ObjectId(application_id)},
            {"$set": {"documents": updated_documents}}
        )
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException as e:
        logger.error(f"HTTPException: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
