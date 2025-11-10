import cloudinary
import cloudinary.uploader
import cloudinary.api
from fastapi import HTTPException

cloudinary.config(
  cloud_name = 'dutui5dbt', 
  api_key = '464547771659791', 
  api_secret = 'M3ky7K8mwExaYbHe4dlRIrHZSYA'
)

# Maximum file size in bytes (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def upload_image(image_file, folder="uploads"):
    """ 
    Uploads an image to Cloudinary with size validation.
    Args:
        image_file: UploadFile object from FastAPI
        folder: Cloudinary folder name
    Returns:
        Secure URL of uploaded image
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
        
        # Upload to Cloudinary
        response = cloudinary.uploader.upload(
            image_file.file,
            folder=folder,
            resource_type="image",
            allowed_formats=["jpg", "jpeg", "png", "gif", "webp"]
        )
        
        return response.get("secure_url")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")