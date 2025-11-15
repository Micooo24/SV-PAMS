from fastapi import HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests
import facebook
import os
from dotenv import load_dotenv
from config.db import db
from datetime import datetime
from utils.otp_utils import create_otp
from config.email_config import send_otp_email
import logging
from bson import ObjectId

load_dotenv()
logger = logging.getLogger(__name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")

async def google_auth(id_token_str: str):
    """Authenticate with Google and send OTP"""
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            id_token_str, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise HTTPException(status_code=400, detail="Invalid token issuer")
        
        # Check if email is verified by Google
        if not idinfo.get('email_verified', False):
            raise HTTPException(status_code=400, detail="Email not verified by Google")
        
        email = idinfo['email']
        name = idinfo.get('name', '')
        given_name = idinfo.get('given_name', '')
        family_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')
        
        # Check if user exists
        user = db["users"].find_one({"email": email.lower()})
        
        if not user:
            # Register new user with better name parsing
            user_dict = {
                "firstname": given_name or (name.split()[0] if name else "User"),
                "lastname": family_name or (name.split()[-1] if len(name.split()) > 1 else ""),
                "middlename": "",
                "email": email.lower(),
                "password": "",  # No password for OAuth users
                "img": picture,
                "role": "customer",
                "is_active": True,
                "auth_provider": "google",
                "google_id": idinfo['sub'],
                "created_at": datetime.now().isoformat(),
                "address": "",
                "barangay": "",
                "birthday": "",
                "age": 0,
                "mobile_no": 0,
                "landline_no": "",
                "zip_code": 0,
                "gender": "other",
                "email_verified": True
            }
            inserted = db["users"].insert_one(user_dict)
            user_id = str(inserted.inserted_id)
            name_display = f"{user_dict['firstname']} {user_dict['lastname']}".strip()
            logger.info(f"New user registered via Google: {email}")
        else:
            user_id = str(user["_id"])
            name_display = f"{user['firstname']} {user['lastname']}".strip()
            
            # Update Google ID and picture if not present
            update_fields = {}
            if "google_id" not in user:
                update_fields["google_id"] = idinfo['sub']
            if "auth_provider" not in user:
                update_fields["auth_provider"] = "google"
            if picture and user.get("img") != picture:
                update_fields["img"] = picture
            
            if update_fields:
                db["users"].update_one({"_id": user["_id"]}, {"$set": update_fields})
        
        # Generate and send OTP
        otp_code = create_otp(email, user_id)
        email_sent = send_otp_email(email, otp_code, name_display)
        
        if not email_sent:
            logger.error(f"Failed to send OTP email to: {email}")
            raise HTTPException(status_code=500, detail="Failed to send OTP email. Please check your email configuration.")
        
        logger.info(f"Google auth successful, OTP sent to: {email}")
        return {
            "message": "OTP sent to your email",
            "email": email,
            "requires_otp": True
        }
        
    except ValueError as e:
        logger.error(f"Google token verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid or expired Google token")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Google auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


async def facebook_auth(access_token: str):
    """Authenticate with Facebook and send OTP"""
    try:
        graph = facebook.GraphAPI(access_token=access_token, version="18.0")
        
        # Get user info
        user_info = graph.get_object(
            id='me',
            fields='id,name,email,first_name,last_name,picture.type(large)'
        )
        
        email = user_info.get('email')
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Facebook. Please grant email permission in Facebook settings.")
        
        name = user_info.get('name', '')
        first_name = user_info.get('first_name', '')
        last_name = user_info.get('last_name', '')
        picture = user_info.get('picture', {}).get('data', {}).get('url', '')
        
        # Check if user exists
        user = db["users"].find_one({"email": email.lower()})
        
        if not user:
            # Register new user
            user_dict = {
                "firstname": first_name or (name.split()[0] if name else "User"),
                "lastname": last_name or (name.split()[-1] if len(name.split()) > 1 else ""),
                "middlename": "",
                "email": email.lower(),
                "password": "",  # No password for OAuth users
                "img": picture,
                "role": "customer",
                "is_active": True,
                "auth_provider": "facebook",
                "facebook_id": user_info['id'],
                "created_at": datetime.now().isoformat(),
                "address": "",
                "barangay": "",
                "birthday": "",
                "age": 0,
                "mobile_no": 0,
                "landline_no": "",
                "zip_code": 0,
                "gender": "other",
                "email_verified": True
            }
            inserted = db["users"].insert_one(user_dict)
            user_id = str(inserted.inserted_id)
            name_display = f"{user_dict['firstname']} {user_dict['lastname']}".strip()
            logger.info(f"New user registered via Facebook: {email}")
        else:
            user_id = str(user["_id"])
            name_display = f"{user['firstname']} {user['lastname']}".strip()
            
            # Update Facebook ID and picture if not present
            update_fields = {}
            if "facebook_id" not in user:
                update_fields["facebook_id"] = user_info['id']
            if "auth_provider" not in user:
                update_fields["auth_provider"] = "facebook"
            if picture and user.get("img") != picture:
                update_fields["img"] = picture
            
            if update_fields:
                db["users"].update_one({"_id": user["_id"]}, {"$set": update_fields})
        
        # Generate and send OTP
        otp_code = create_otp(email, user_id)
        email_sent = send_otp_email(email, otp_code, name_display)
        
        if not email_sent:
            logger.error(f"Failed to send OTP email to: {email}")
            raise HTTPException(status_code=500, detail="Failed to send OTP email. Please check your email configuration.")
        
        logger.info(f"Facebook auth successful, OTP sent to: {email}")
        return {
            "message": "OTP sent to your email",
            "email": email,
            "requires_otp": True
        }
        
    except facebook.GraphAPIError as e:
        logger.error(f"Facebook API error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid Facebook token: {str(e)}")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Facebook auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


async def verify_otp_and_login(email: str, otp_code: str):
    """Verify OTP and complete login"""
    from utils.otp_utils import verify_otp
    from utils.utils import create_access_token
    
    try:
        # Verify OTP
        if not verify_otp(email, otp_code):
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # Get user
        user = db["users"].find_one({"email": email.lower()})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update last login
        db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now().isoformat()}}
        )
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": user["email"],
                "user_id": str(user["_id"]),
                "role": user["role"]
            }
        )
        
        # Prepare user response (remove sensitive data)
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
            "barangay": user.get("barangay"),
            "auth_provider": user.get("auth_provider", "local")
        }
        
        logger.info(f"OTP verified, user logged in: {email}")
        return {
            "message": "Login successful",
            "user": user_response,
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"OTP verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")
