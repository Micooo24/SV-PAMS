from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from controllers.users import register, login
from controllers.oauth_controllers import google_auth, facebook_auth, verify_otp_and_login
from models.users import Role, Gender
from datetime import date
from pydantic import BaseModel
from config.db import db  # Add this import

router = APIRouter()

class GoogleAuthRequest(BaseModel):
    id_token: str

class FacebookAuthRequest(BaseModel):
    access_token: str

class OTPVerifyRequest(BaseModel):
    email: str
    otp_code: str

@router.post("/register")
async def register_user(
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
    role: Role = Form(...),
    img: UploadFile = File(None)
):
    return await register(
        firstname, lastname, middlename, address, barangay, 
        email, password, birthday, age, mobile_no, 
        landline_no, zip_code, gender, role, img
    )

@router.post("/login")
async def login_user(
    email: str = Form(...),
    password: str = Form(...)
):
    return await login(email, password)

@router.post("/auth/google")
async def google_login(request: GoogleAuthRequest):
    """Google OAuth login/register with OTP"""
    return await google_auth(request.id_token)

@router.post("/auth/facebook")
async def facebook_login(request: FacebookAuthRequest):
    """Facebook OAuth login/register with OTP"""
    return await facebook_auth(request.access_token)

@router.post("/auth/verify-otp")
async def verify_otp(request: OTPVerifyRequest):
    """Verify OTP and complete login"""
    return await verify_otp_and_login(request.email, request.otp_code)

@router.post("/auth/resend-otp")
async def resend_otp(email: str = Form(...)):
    """Resend OTP to user's email"""
    from utils.otp_utils import create_otp
    from config.email_config import send_otp_email
    
    user = db["users"].find_one({"email": email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    name = f"{user['firstname']} {user['lastname']}"
    otp_code = create_otp(email, str(user["_id"]))
    send_otp_email(email, otp_code, name)
    
    return {"message": "OTP resent successfully"}