from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Request, Depends, Body
from fastapi.responses import JSONResponse

# MongoDB
from config.db import db

# For Google Login
import secrets
from typing import Optional

# Cloudinary
import cloudinary.uploader
import config.cloudinary_config 

import requests

# Image Requirements
from config.cloudinary_config import upload_image, MAX_FILE_SIZE

# bcrypt
import bcrypt

# Import JWT function and email sending utilities from utils
from utils.utils import (
    create_access_token, 
    generate_otp, 
    get_otp_expiry, 
    send_verification_email, 
    verify_otp_code,
    store_otp,  
    get_otp,    
    delete_otp  
)

# for update profile and added security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from utils.utils import SECRET_KEY, ALGORITHM

security = HTTPBearer()

# Logging
import logging 

from bson import ObjectId
from datetime import timedelta, datetime, date

# Pydantic Models
from models.users import User, UserResponse, Role, Gender

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Register - Send OTP
async def register(
    firstname: str = Form(...),
    lastname: str = Form(...),
    middlename: str = Form(""),
    address: str = Form(...),
    barangay: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    birthday: Optional[str] = Form(None),
    age: int = Form(...),
    mobile_no: int = Form(...),
    landline_no: str = Form(""),
    zip_code: int = Form(...),
    gender: str = Form(...),
    role: str = Form("user"),  
    img: UploadFile = File(None)
):
    try:
       
        gender_enum = None
        if gender and gender.strip():
            gender_lower = gender.lower().strip()
            logger.info(f"Converting gender '{gender}' to enum...")
            if gender_lower == "male":
                gender_enum = Gender.male
            elif gender_lower == "female":
                gender_enum = Gender.female
            else:
                logger.error(f"Invalid gender value: '{gender}'")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Gender must be 'male' or 'female', received: '{gender}'"
                )
        
        birthday_str = ""
        if birthday:
            logger.info(f"Processing birthday: '{birthday}' (type: {type(birthday).__name__})")
            if isinstance(birthday, str):
                birthday_str = birthday.strip()
            elif isinstance(birthday, date):
                birthday_str = birthday.isoformat()
            
            # Validate format
            try:
                datetime.strptime(birthday_str, "%Y-%m-%d")
                logger.info(f"Birthday validated: '{birthday_str}'")
            except ValueError as e:
                logger.error(f"Invalid birthday format: '{birthday_str}' - {str(e)}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid birthday format. Use YYYY-MM-DD, received: '{birthday}'"
                )
        
        logger.info("Creating User model...")
        
        # Validate with User model
        try:
            user_model = User(
                firstname=firstname.strip(),
                lastname=lastname.strip(),
                middlename=middlename.strip() if middlename else "",
                address=address.strip(),
                barangay=barangay.strip(),
                email=email.lower().strip(), 
                password=password,
                birthday=birthday_str,
                age=age,
                mobile_no=mobile_no,
                landline_no=landline_no.strip() if landline_no else "",
                zip_code=zip_code,
                gender=gender_enum, 
                role=role
            )
            logger.info("User model created successfully!")
        except Exception as validation_error:
            logger.error(f"User model validation failed: {str(validation_error)}")
            logger.error(f"Validation error type: {type(validation_error).__name__}")
            raise HTTPException(
                status_code=400, 
                detail=f"Validation error: {str(validation_error)}"
            )
        
        # Check if email already exists
        if db["users"].find_one({"email": user_model.email}):
            logger.warning(f"Email already registered: {user_model.email}")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Upload image
        img_url = None
        if img and img.filename:
            logger.info(f"Uploading image: {img.filename}")
            result = cloudinary.uploader.upload(img.file, folder="users")
            img_url = result.get("secure_url")
            logger.info(f"Image uploaded: {img_url}")
        
        # Generate OTP
        otp_code = generate_otp()
        otp_expiry = get_otp_expiry()
        logger.info(f"OTP generated for {user_model.email}")
        
        # Convert model to dict
        user_dict = user_model.model_dump()
        user_dict.update({
            "password": hashed_password.decode('utf-8'),
            "img": img_url,
            "role": "user",
            "is_active": False,
            "is_verified": False,
            "created_at": datetime.now().isoformat()
        })

        # Insert user
        inserted_user = db["users"].insert_one(user_dict)
        user_dict["_id"] = str(inserted_user.inserted_id)
        logger.info(f"User inserted with ID: {user_dict['_id']}")
        
        # Store OTP in memory
        store_otp(user_model.email, otp_code, otp_expiry)
        
        # Send OTP email
        email_sent = send_verification_email(
            email=user_model.email,
            otp=otp_code,
            user_name=firstname
        )
        
        if not email_sent:
            logger.warning(f"Failed to send OTP email to {user_model.email}")
        else:
            logger.info(f"OTP email sent successfully to {user_model.email}")
        
        logger.info("Registration completed successfully!")
        return {
            "message": "Registration successful. Please check your Gmail for OTP verification code.",
            "email": user_model.email,
            "otp_sent": email_sent
        }
    
    except HTTPException as e:
        logger.error(f"HTTPException: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

#  Verify OTP Endpoint
async def verify_otp(
    email: str = Form(...),
    otp_code: str = Form(...)
):
    """Verify OTP and activate user account"""
    try:
        # Find user
        user = db["users"].find_one({"email": email.lower().strip()})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if already verified
        if user.get("is_verified", False):
            raise HTTPException(status_code=400, detail="Account already verified")
        
        # Get OTP from memory (not database)
        otp_data = get_otp(email.lower().strip())
        if not otp_data:
            raise HTTPException(status_code=400, detail="OTP not found or expired. Please request a new one.")
        
        # Verify OTP
        stored_otp = otp_data["otp"]
        stored_expiry = otp_data["expires_at"]
        
        if not verify_otp_code(stored_otp, stored_expiry, otp_code):
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        #  Delete OTP from memory after successful verification
        delete_otp(email.lower().strip())
        
        # Update user as verified
        db["users"].update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "is_verified": True,
                    "is_active": True
                }
            }
        )
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": user["email"],
                "user_id": str(user["_id"]),
                "role": user["role"]
            }
        )
        
        user["_id"] = str(user["_id"])
        user["is_verified"] = True
        user["is_active"] = True
        
        logger.info(f"User verified successfully: {email}")
        return {
            "message": "Email verified successfully. You can now login.",
            "user": UserResponse(**user),
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"OTP verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


#  Resend OTP
async def resend_otp(
    
    email: str = Form(...)):
    """Resend OTP to user's email"""
    try:
        user = db["users"].find_one({"email": email.lower().strip()})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.get("is_verified", False):
            raise HTTPException(status_code=400, detail="Account already verified")
        
        # Generate new OTP
        otp_code = generate_otp()
        otp_expiry = get_otp_expiry()
        
        #  Store in memory (overwrites old OTP)
        store_otp(email.lower().strip(), otp_code, otp_expiry)
        
        # Send OTP email
        email_sent = send_verification_email(
            email=email,
            otp=otp_code,
            user_name=user.get("firstname", "User")
        )
        
        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send OTP email")
        
        logger.info(f"OTP resent to: {email}")
        return {
            "message": "OTP sent successfully. Please check your Gmail.",
            "email": email
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Resend OTP error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Login - Block unverified users
async def login(
    email: str = Form(...),
    password: str = Form(...),
    fcm_token: Optional[str] = Form(None)
):
    try:
        user = db["users"].find_one({"email": email.lower().strip()})
        if not user:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        #  Check if verified
        if not user.get("is_verified", False):
            raise HTTPException(
                status_code=403,
                detail="Please verify your email first. Check your Gmail for OTP."
            )

        if not bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            raise HTTPException(status_code=400, detail="Invalid email or password")

        access_token = create_access_token(
            data={
                "sub": user["email"],
                "user_id": str(user["_id"]),
                "role": user["role"]
            }
        )
        
        update_data = {"last_login": datetime.now().isoformat()}
        if fcm_token:
            update_data["fcm_token"] = fcm_token
        
        db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": update_data}
        )

        user["_id"] = str(user["_id"])

        return {
            "message": "Login successful",
            "user": UserResponse(**user),  
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Google Login
async def google_login(
    email: str = Form(...),
    givenName: Optional[str] = Form(None),
    familyName: Optional[str] = Form(None),
    photo: Optional[str] = Form(None),
    name: str = Form(...),
    fcm_token: Optional[str] = Form(None)
):
    """
    Handle Google OAuth login - using Pydantic models
    """
    try:
        logger.info(f"Google login attempt - email: {email}, name: {name}, givenName: {givenName}, familyName: {familyName}")
        email = email.lower().strip()
        
        # Check if user already exists
        existing_user = db["users"].find_one({"email": email})
        
        if existing_user:
            # EXISTING USER - Login flow
            access_token = create_access_token(
                data={
                    "sub": existing_user["email"],
                    "user_id": str(existing_user["_id"]),
                    "role": existing_user["role"]
                }
            )
            
            # Update last login and photo if provided
            update_data = {"last_login": datetime.now().isoformat()}
            if photo:
                update_data["img"] = photo   
            if fcm_token:
                update_data["fcm_token"] = fcm_token
            
            db["users"].update_one(
                {"_id": existing_user["_id"]},
                {"$set": update_data}
            )
            
            existing_user["_id"] = str(existing_user["_id"])
            
            logger.info(f"Google login successful (existing user): {email}")
            return {
                "message": "Login successful",
                "user": UserResponse(**existing_user),  
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": 86400
            }
        
        else:
            # NEW USER - Registration flow using User model
            random_password = secrets.token_urlsafe(32)
            hashed_password = bcrypt.hashpw(random_password.encode('utf-8'), bcrypt.gensalt())
            
            # Validate using User model
            user_model = User(
                firstname=(givenName or name.split()[0]).strip() if (givenName or name) else "",
                lastname=(familyName or (name.split()[-1] if len(name.split()) > 1 else "")).strip(),
                middlename="",
                address="",
                barangay="",
                email=email,  # Will validate Gmail in model
                password=hashed_password.decode('utf-8'),
                birthday="",
                age=0,
                mobile_no=0,
                landline_no="",
                zip_code=0,
                gender=None,
                img=photo,
                role=Role.user, 
                is_active=True,
                is_verified=True  #  Google users are auto-verified
            )
            
            # Convert to dict
            user_dict = user_model.model_dump()
            user_dict["created_at"] = datetime.now().isoformat()
            
            # Insert into database
            inserted_user = db["users"].insert_one(user_dict)
            user_dict["_id"] = str(inserted_user.inserted_id)
            
            # Create access token
            access_token = create_access_token(
                data={
                    "sub": email,
                    "user_id": user_dict["_id"],
                    "role": "user"
                }
            )
            
            # Update last login
            db["users"].update_one(
                {"_id": inserted_user.inserted_id},
                {"$set": {"last_login": datetime.now().isoformat()}}
            )
            
            logger.info(f"Google login successful (new user created): {email}")
            return {
                "message": "Login successful",
                "user": UserResponse(**user_dict), 
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": 86400
            }
    
    except HTTPException as e:
        logger.error(f"HTTPException in google_login: {str(e)}")
        raise e
    except Exception as e:
        import traceback
        logger.error(f"Error in google_login: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    

 
 # Facebook Login
async def facebook_login(
    email: str = Form(...),
    firstName: Optional[str] = Form(None),
    lastName: Optional[str] = Form(None),
    photo: Optional[str] = Form(None),
    name: str = Form(...),
    facebookId: Optional[str] = Form(None),
    fcm_token: Optional[str] = Form(None),
    access_token: Optional[str] = Form(None)
):
    """
    Handle Facebook OAuth login - using Pydantic models
    """
    try:
        email = email.lower().strip()
        
        # Fetch high-quality profile picture using Facebook Graph API
        profile_picture_url = photo
        if facebookId and access_token:
            try:
                # Use Graph API with redirect=false to get JSON response
                graph_url = f"https://graph.facebook.com/v18.0/{facebookId}/picture?type=large&width=500&height=500&redirect=false&access_token={access_token}"
                response = requests.get(graph_url, timeout=10)
                
                if response.status_code == 200:
                    photo_data = response.json()
                    
                    # Check if photo is not a silhouette
                    if photo_data.get("data") and not photo_data["data"].get("is_silhouette", True):
                        image_url = photo_data["data"]["url"]
                        
                        # Download the actual image
                        image_response = requests.get(image_url, timeout=10)
                        
                        if image_response.status_code == 200:
                            # Upload to Cloudinary
                            cloudinary_result = cloudinary.uploader.upload(
                                image_response.content,
                                folder="users/facebook",
                                public_id=f"facebook_{facebookId}",
                                overwrite=True
                            )
                            profile_picture_url = cloudinary_result.get("secure_url")
                            logger.info(f"Uploaded Facebook profile picture to Cloudinary for user: {email}")
            except Exception as e:
                logger.warning(f"Failed to fetch/upload Facebook profile picture for {email}: {str(e)}")
        
        # Check if user already exists
        existing_user = db["users"].find_one({"email": email})
        
        if existing_user:
            # EXISTING USER - Update and login
            access_token_jwt = create_access_token(
                data={
                    "sub": existing_user["email"],
                    "user_id": str(existing_user["_id"]),
                    "role": existing_user["role"]
                }
            )
            
            # Update last login and photo
            update_data = {"last_login": datetime.now().isoformat()}
            if profile_picture_url:
                update_data["img"] = profile_picture_url
            if facebookId:
                update_data["facebook_id"] = facebookId
            if fcm_token:
                update_data["fcm_token"] = fcm_token
            
            db["users"].update_one(
                {"_id": existing_user["_id"]},
                {"$set": update_data}
            )
            
            existing_user["_id"] = str(existing_user["_id"])
            
            logger.info(f"Facebook login successful (existing user): {email}")
            return {
                "message": "Login successful",
                "user": UserResponse(**existing_user),
                "access_token": access_token_jwt,
                "token_type": "bearer",
                "expires_in": 86400
            }
        
        else:
            # NEW USER - Create account
            random_password = secrets.token_urlsafe(32)
            hashed_password = bcrypt.hashpw(random_password.encode('utf-8'), bcrypt.gensalt())
            
            # Parse names
            first_name = (firstName or name.split()[0] if name else "").strip()
            last_name = (lastName or " ".join(name.split()[1:]) if name and len(name.split()) > 1 else "").strip()
            
            # Create user model
            user_model = User(
                firstname=first_name,
                lastname=last_name,
                middlename="",
                address="",
                barangay="",
                email=email,
                password=hashed_password.decode('utf-8'),
                birthday="",
                age=0,
                mobile_no=0,
                landline_no="",
                zip_code=0,
                gender=None,
                img=profile_picture_url,
                role=Role.user,
                is_active=True,
                is_verified=True
            )
            
            # Convert to dict and add metadata
            user_dict = user_model.model_dump()
            user_dict["created_at"] = datetime.now().isoformat()
            if facebookId:
                user_dict["facebook_id"] = facebookId
            if fcm_token:
                user_dict["fcm_token"] = fcm_token
            
            # Insert into database
            inserted_user = db["users"].insert_one(user_dict)
            user_dict["_id"] = str(inserted_user.inserted_id)
            
            # Create access token
            access_token_jwt = create_access_token(
                data={
                    "sub": email,
                    "user_id": user_dict["_id"],
                    "role": "user"
                }
            )
            
            # Update last login
            db["users"].update_one(
                {"_id": inserted_user.inserted_id},
                {"$set": {"last_login": datetime.now().isoformat()}}
            )
            
            logger.info(f"Facebook login successful (new user created): {email}")
            return {
                "message": "Login successful",
                "user": UserResponse(**user_dict),
                "access_token": access_token_jwt,
                "token_type": "bearer",
                "expires_in": 86400
            }
    
    except HTTPException as e:
        logger.error(f"HTTPException in facebook_login: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Error in facebook_login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
# Get Current User Profile (Authenticated)
async def get_current_user_profile(credentials: HTTPAuthorizationCredentials):
    """
    Get authenticated user's full profile details
    """
    try:
        token = credentials.credentials
        
        # Decode JWT token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token or expired token")
        
        # Find user by ID
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        
        logger.info(f"Profile retrieved for user: {user['email']}")
        return {
            "message": "Profile retrieved successfully",
            "user": UserResponse(**user)
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    

 # Update User Profile (Authenticated)
async def update_user_profile(
    credentials: HTTPAuthorizationCredentials,
    firstname: Optional[str] = Form(None),
    lastname: Optional[str] = Form(None),
    mobile_no: Optional[int] = Form(None),
    address: Optional[str] = Form(None),
    barangay: Optional[str] = Form(None),
    img: UploadFile = File(None)
):
    """
    Update authenticated user's profile
    Only allows updating: firstname, lastname, mobile_no, address, barangay, img
    """
    try:
        token = credentials.credentials
        
        # Decode JWT token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token or expired token")
        
        # Find user by ID
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Build update data (only include fields that are provided)
        update_data = {}
        
        if firstname is not None and firstname.strip():
            update_data["firstname"] = firstname.strip()
        
        if lastname is not None and lastname.strip():
            update_data["lastname"] = lastname.strip()
        
        if mobile_no is not None:
            update_data["mobile_no"] = mobile_no
          
        if address is not None:
            update_data["address"] = address.strip()
        
        if barangay is not None:
            update_data["barangay"] = barangay.strip()
        
        # Upload new image if provided
        if img and img.filename:
            logger.info(f"Uploading new profile image: {img.filename}")
            result = cloudinary.uploader.upload(
                img.file, 
                folder="users/profiles",
                public_id=f"user_{user_id}",
                overwrite=True
            )
            img_url = result.get("secure_url")
            update_data["img"] = img_url
            logger.info(f"Image uploaded: {img_url}")
        
        # Check if there's anything to update
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided to update")
        
        # Update user in database
        db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = db["users"].find_one({"_id": ObjectId(user_id)})
        updated_user["_id"] = str(updated_user["_id"])
        
        logger.info(f"Profile updated successfully for user: {updated_user['email']}")
        return {
            "message": "Profile updated successfully",
            "user": UserResponse(**updated_user)
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))