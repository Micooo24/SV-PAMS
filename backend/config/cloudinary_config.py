import cloudinary
import cloudinary.uploader
import cloudinary.api
from fastapi import HTTPException
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '../secrets_backend/.env'))


cloudinary.config(
  cloud_name = os.getenv("CLOUD_NAME"), 
  api_key = os.getenv("CLOUD_API_KEY"), 
  api_secret = os.getenv("CLOUD_API_SECRET")
)

# Maximum file size in bytes (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Supported formats
IMAGE_FORMATS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"]
DOCUMENT_FORMATS = ["pdf", "doc", "docx", "txt"]

def upload_image(image_file, folder="uploads"):
    """ 
    Uploads an image/document to Cloudinary with size validation.
    Args:
        image_file: UploadFile object from FastAPI
        folder: Cloudinary folder name
    Returns:
        Secure URL of uploaded file
    """
    try:
        # Read file content
        file_content = image_file.file.read()
        file_size = len(file_content)
        
        # Validate file size
        if file_size > MAX_FILE_SIZE:
            size_mb = file_size / (1024 * 1024)
            raise HTTPException(
                status_code=400, 
                detail=f"File size ({size_mb:.2f}MB) exceeds maximum allowed size of 10MB"
            )
        
        # Reset file pointer to beginning
        image_file.file.seek(0)
        
        # Get file extension
        file_extension = image_file.filename.split('.')[-1].lower()
        
        # Validate file format
        all_formats = IMAGE_FORMATS + DOCUMENT_FORMATS
        if file_extension not in all_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format. Allowed: {', '.join(all_formats)}"
            )
        
        # Determine resource type
        resource_type = "image" if file_extension in IMAGE_FORMATS else "raw"
        
        # Upload to Cloudinary
        response = cloudinary.uploader.upload(
            image_file.file,
            folder=folder,
            resource_type=resource_type,
            allowed_formats=all_formats
        )
        
        return response.get("secure_url")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    

def upload_image_cart(image_bytes: bytes, folder="uploads"):
    """
    Uploads an image to Cloudinary with size validation.
    Args:
        image_bytes: Raw image bytes
        folder: Cloudinary folder name
    Returns:
        Secure URL of uploaded file
    """
    try:
        # Validate file size
        file_size = len(image_bytes)
        if file_size > MAX_FILE_SIZE:
            size_mb = file_size / (1024 * 1024)
            raise HTTPException(
                status_code=400, 
                detail=f"File size ({size_mb:.2f}MB) exceeds maximum allowed size of 10MB"
            )

        # Upload to Cloudinary
        response = cloudinary.uploader.upload(
            image_bytes,
            folder=folder,
            resource_type="image"
        )

        return response.get("secure_url")
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")