from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Request, Depends, Body
from fastapi.responses import JSONResponse

# MongoDB
from config.db import db

# Cloudinary
import cloudinary.uploader
import config.cloudinary_config

# bcrypt
import bcrypt

# Logging
import logging 

from bson import ObjectId
from datetime import timedelta, datetime, date
from models.users import Role, Gender

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Register Customer/Vendor
def register(
    firstname: str = Form(...),
    lastname: str = Form(...),
    middlename: str = Form(...),
    address: str = Form(...),
    barangay: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    birthday: date = Form(...),
    age: int = Form(...),
    mobile_no: int = Form(...),
    landline_no: str = Form(...),
    zip_code: int = Form(...),
    gender: Gender = Form(...), 
    img: UploadFile = File(None) 
    
):
    try:
        if db["users"].find_one({"email": email}):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        img_url = None
        if img:
            try:
                # Ensure the "users" folder exists in Cloudinary
                result = cloudinary.uploader.upload(img.file, folder="users")
                img_url = result.get("secure_url")
            except Exception as e:
                logger.error(f"Image upload failed: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
        
        birthday_str = birthday.strftime("%Y-%m-%d")
        
        user_dict = {
                "firstname": firstname,
                "lastname": lastname,
                "middlename": middlename,
                "address": address,
                "barangay": barangay,
                "email": email,
                "password": hashed_password.decode('utf-8'),
                "birthday": birthday_str,
                "age": age,
                "mobile_no": mobile_no,
                "landline_no": landline_no,
                "zip_code": zip_code,
                "img_path": img_url,
                "gender": gender,
                "role": Role.customer,
                "created_at": datetime.now().isoformat(),  # Add created_at field

            }

        inserted_user = db["users"].insert_one(user_dict)
        user_dict["_id"] = str(inserted_user.inserted_id)
        return user_dict
    
    except HTTPException as e:
        logger.error(f"HTTPException: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    