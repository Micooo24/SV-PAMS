from config.db import db
from config.cloudinary_config import upload_image
from models.base_documents import DocumentCategory
from datetime import datetime
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

# Just regular async functions - NO CLASS NEEDED
async def upload_base_document(file, title: str, category: str, description: str):
    """Upload base document to Cloudinary and save to MongoDB"""
    try:
        # Validate category
        if category not in [cat.value for cat in DocumentCategory]:
            return {
                "success": False,
                "error": f"Invalid category. Choose from: {[cat.value for cat in DocumentCategory]}"
            }
        
        # Upload to Cloudinary
        file_url = upload_image(file, folder="base_documents")
        
        # Create document
        base_doc_dict = {
            "title": title.strip(),
            "filename": file.filename,
            "file_type": file.content_type,
            "file_url": file_url,
            "category": category,
            "description": description.strip(),
            "uploaded_at": datetime.now().isoformat(),
            "is_active": True
        }
        
        # Insert into MongoDB
        result = db["base_documents"].insert_one(base_doc_dict)
        base_doc_dict["_id"] = str(result.inserted_id)
        
        logger.info(f"Base document uploaded: {title}")
        
        return {
            "success": True,
            "document": base_doc_dict
        }
    
    except Exception as e:
        logger.error(f"Error uploading base document: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


def get_all_base_documents(category: str = None):
    """Get all active base documents"""
    try:
        query = {"is_active": True}
        if category:
            query["category"] = category
        
        documents = list(db["base_documents"].find(query))
        
        for doc in documents:
            doc["_id"] = str(doc["_id"])
        
        return {
            "success": True,
            "documents": documents
        }
    
    except Exception as e:
        logger.error(f"Error fetching documents: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


def get_base_document_by_id(document_id: str):
    """Get single base document by ID"""
    try:
        document = db["base_documents"].find_one({"_id": ObjectId(document_id)})
        
        if not document:
            return {
                "success": False,
                "error": "Document not found"
            }
        
        document["_id"] = str(document["_id"])
        
        return {
            "success": True,
            "document": document
        }
    
    except Exception as e:
        logger.error(f"Error fetching document: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }