from config.db import db
from config.cloudinary_config import upload_image
from models.base_documents import DocumentCategory
from datetime import datetime
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

# Just regular async functions 
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

def update_base_document_by_id(
    document_id: str, 
    file = None,
    title: str = None, 
    category: str = None, 
    description: str = None,
    is_active: bool = None
):
    """Update base documents by ID"""
    try:
        # Check if document exists
        existing_doc = db["base_documents"].find_one({"_id": ObjectId(document_id)})
        
        if not existing_doc:
            return {
                "success": False,
                "error": "Document not found"
            }
        
        # Prepare update fields
        update_fields = {}
        
        # Update title if provided
        if title is not None:
            update_fields["title"] = title.strip()
        
        # Update category if provided and valid
        if category is not None:
            if category not in [cat.value for cat in DocumentCategory]:
                return {
                    "success": False,
                    "error": f"Invalid category. Choose from: {[cat.value for cat in DocumentCategory]}"
                }
            update_fields["category"] = category
        
        # Update description if provided
        if description is not None:
            update_fields["description"] = description.strip()
        
        # Update is_active status if provided
        if is_active is not None:
            update_fields["is_active"] = is_active
        
        # Update file if new file is uploaded
        if file is not None:
            try:
                # Upload new file to Cloudinary
                new_file_url = upload_image(file, folder="base_documents")
                
                update_fields["filename"] = file.filename
                update_fields["file_type"] = file.content_type
                update_fields["file_url"] = new_file_url
                
                logger.info(f"New file uploaded for document: {document_id}")
            except Exception as upload_error:
                logger.error(f"Error uploading new file: {str(upload_error)}")
                return {
                    "success": False,
                    "error": f"File upload failed: {str(upload_error)}"
                }
        
        # Add updated timestamp
        update_fields["updated_at"] = datetime.now().isoformat()
        
        # Check if there are fields to update
        if not update_fields:
            return {
                "success": False,
                "error": "No fields to update"
            }
        
        # Perform update
        result = db["base_documents"].update_one(
            {"_id": ObjectId(document_id)},
            {"$set": update_fields}
        )
        
        if result.modified_count == 0:
            return {
                "success": False,
                "error": "No changes made to document"
            }
        
        # Fetch updated document
        updated_doc = db["base_documents"].find_one({"_id": ObjectId(document_id)})
        updated_doc["_id"] = str(updated_doc["_id"])
        
        logger.info(f"Base document updated: {document_id}")
        
        return {
            "success": True,
            "document": updated_doc,
            "message": "Document updated successfully"
        }
    
    except Exception as e:
        logger.error(f"Error updating document: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
