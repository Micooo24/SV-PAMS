from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from controllers.users import register, login
from models.users import Role, Gender
from datetime import date

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
    password: str = Form(...)
):
    return await login(email, password)