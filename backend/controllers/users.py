from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Request, Depends, Body
from fastapi.responses import JSONResponse

# MongoDB
from config.db import db

# Cloudinary
import cloudinary.uploader
import config.cloudinary_config 

# Image Requirements
from config.cloudinary_config import upload_image, MAX_FILE_SIZE

# bcrypt
import bcrypt

# Import JWT function from utils
from utils.utils import create_access_token

# Logging
import logging 

from bson import ObjectId
from datetime import timedelta, datetime, date
from models.users import Role, Gender

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Register Customer/Vendor
async def register(
    firstname: str = Form(...),
    lastname: str = Form(...),
    middlename: str = Form(""),
    address: str = Form(...),
    barangay: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    birthday: str = Form(...),
    age: int = Form(...),
    mobile_no: int = Form(...),
    landline_no: str = Form(""),
    zip_code: int = Form(...),
    gender: str = Form(...),
    role: str = Form("customer"),
    img: UploadFile = File(None)
):
    try:
        if db["users"].find_one({"email": email.lower()}):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        img_url = None
        if img and img.filename:
            try:
                result = cloudinary.uploader.upload(img.file, folder="users")
                img_url = result.get("secure_url")
            except Exception as e:
                logger.error(f"Image upload failed: {str(e)}")
                img_url = None
        
        # Parse birthday - Handle both string and date object
        try:
            if isinstance(birthday, str):
                birthday_date = datetime.strptime(birthday, "%Y-%m-%d").date()
            elif isinstance(birthday, date):
                birthday_date = birthday
            else:
                raise ValueError("Invalid birthday type")
            
            birthday_str = birthday_date.strftime("%Y-%m-%d")
        except (ValueError, AttributeError) as e:
            logger.error(f"Birthday parsing error: {str(e)}, birthday type: {type(birthday)}, value: {birthday}")
            raise HTTPException(status_code=400, detail="Invalid birthday format. Use YYYY-MM-DD")
        
        user_dict = {
            "firstname": firstname.strip(),
            "lastname": lastname.strip(),
            "middlename": middlename.strip(),
            "address": address.strip(),
            "barangay": barangay.strip(),
            "email": email.lower().strip(),
            "password": hashed_password.decode('utf-8'),
            "birthday": birthday_str,
            "age": age,
            "mobile_no": mobile_no,
            "landline_no": landline_no.strip(),
            "zip_code": zip_code,
            "img": img_url,
            "gender": gender,
            "role": role,
            "is_active": True,
            "created_at": datetime.now().isoformat(),
        }

        inserted_user = db["users"].insert_one(user_dict)
        user_dict["_id"] = str(inserted_user.inserted_id)
        del user_dict["password"]  # Remove password from response
        
        logger.info(f"User registered successfully: {email}")
        return {"message": "Registration successful", "user": user_dict}
    
    except HTTPException as e:
        logger.error(f"HTTPException: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# Login with 1-Day Token Expiration
async def login(
    email: str = Form(...),
    password: str = Form(...)
):
    try:
        user = db["users"].find_one({"email": email.lower().strip()})
        if not user:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        if not bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            raise HTTPException(status_code=400, detail="Invalid email or password")

   
        # Create access token with 1-day expiration (using your existing function)
        access_token = create_access_token(
            data={
                "sub": user["email"],
                "user_id": str(user["_id"]),
                "role": user["role"]
            }
            # No expires_delta parameter = uses default 1 day from utils.py
        )

        # Update last login
        db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now().isoformat()}}
        )

        # Prepare user response (remove password)
        user_response = {
            "_id": str(user["_id"]),
            "firstname": user["firstname"],
            "lastname": user["lastname"],
            "middlename": user.get("middlename", ""),
            "email": user["email"],
            "role": user["role"],
            "img": user.get("img"),
            "is_active": user.get("is_active", True),
            "mobile_no": user.get("mobile_no"),
            "address": user.get("address"),
            "barangay": user.get("barangay")
        }

        logger.info(f"User logged in successfully: {email}")
        return {
            "message": "Login successful",
            "user": user_response,
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400  # 1 day in seconds (24 * 60 * 60)
        }

    except HTTPException as e:
        logger.error(f"HTTPException: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")