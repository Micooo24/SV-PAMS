from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from controllers.auth import register, login, google_login
from models.users import Role, Gender
from datetime import date
from typing import Optional

router = APIRouter()

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
    password: str = Form(...),
    fcm_token: Optional[str] = Form(None)
):
    return await login(email, password, fcm_token)


@router.post("/google-login")
async def google_login_user(
    email: str = Form(...),
    givenName: Optional[str] = Form(None),
    familyName: Optional[str] = Form(None),
    photo: Optional[str] = Form(None),
    name: str = Form(...),
    fcm_token: Optional[str] = Form(None)
):
    return await google_login(email, givenName, familyName, photo, name, fcm_token)
