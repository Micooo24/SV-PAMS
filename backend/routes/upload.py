from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from config.cloudinary_config import cloudinary
import cloudinary.uploader
from utils.utils import get_current_user

router = APIRouter()

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    """Upload image to Cloudinary"""
    try:
        # Read file content
        contents = await file.read()
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder="vendor_applications",
            resource_type="image",
            transformation=[
                {'width': 800, 'height': 800, 'crop': 'limit'},
                {'quality': 'auto:good'}
            ]
        )
        
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "format": result.get("format"),
            "width": result.get("width"),
            "height": result.get("height")
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )
