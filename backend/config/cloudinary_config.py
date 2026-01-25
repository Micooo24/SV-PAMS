import cloudinary
import cloudinary.uploader
import cloudinary.api
import cloudinary.utils 
from fastapi import HTTPException
from dotenv import load_dotenv
import os
import re # (for extracting Public ID)

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../secrets_backend/.env'))

cloudinary.config(
  cloud_name = os.getenv("CLOUD_NAME"), 
  api_key = os.getenv("CLOUD_API_KEY"), 
  api_secret = os.getenv("CLOUD_API_SECRET")
)

# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
IMAGE_FORMATS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"]
DOCUMENT_FORMATS = ["pdf", "doc", "docx", "txt"]

#  Generate Signed URL for Downloads
def generate_signed_url(file_url):
    try:
        # Extracts path after /upload/ including the extension
        match = re.search(r'/upload/(?:v\d+/)?(.+?\.[a-zA-Z0-9]+)$', file_url)
        if not match: return file_url

        full_public_id = match.group(1) 
        resource_type = "image" if full_public_id.lower().endswith(".pdf") else "raw"

        # IMPORTANT: Use type="upload" because your upload_file 
        # function uses "access_mode": "public" and "type": "upload"
        signed_url, options = cloudinary.utils.cloudinary_url(
            full_public_id,
            resource_type=resource_type,
            type="upload", 
            sign_url=True
        )
        return signed_url
    except Exception as e:
        return file_url
    
# Upload File
def upload_file(file, folder="uploads"):
    try:
        file_content = file.file.read()
        file_size = len(file_content)
        
        if file_size > MAX_FILE_SIZE:
            size_mb = file_size / (1024 * 1024)
            raise HTTPException(
                status_code=400, 
                detail=f"File size ({size_mb:.2f}MB) exceeds maximum allowed size"
            )
        
        file.file.seek(0)
        file_extension = file.filename.split('.')[-1].lower()
        
        all_formats = IMAGE_FORMATS + DOCUMENT_FORMATS
        if file_extension not in all_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format. Allowed: {', '.join(all_formats)}"
            )
        
        # UPDATED LOGIC HERE
        if file_extension == "pdf":
            resource_type = "auto"
        elif file_extension in IMAGE_FORMATS:
            resource_type = "image"
        else:
            resource_type = "raw"
        
        upload_params = {
            "folder": folder,
            "resource_type": resource_type,
            "access_mode": "public",
            "type": "upload",
            "upload_preset": "ml_default"
        }
        
        if resource_type == "raw":
            upload_params["format"] = file_extension
        
        response = cloudinary.uploader.upload(
            file.file,
            **upload_params
        )
        
        return response.get("secure_url")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    

def upload_image_cart(image_bytes: bytes, folder="uploads"):
    """
    Uploads an image to Cloudinary with size validation.
    """
    try:
        file_size = len(image_bytes)
        if file_size > MAX_FILE_SIZE:
            size_mb = file_size / (1024 * 1024)
            raise HTTPException(
                status_code=400, 
                detail=f"File size ({size_mb:.2f}MB) exceeds maximum allowed size"
            )

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