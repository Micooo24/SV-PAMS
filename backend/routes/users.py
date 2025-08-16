from fastapi import APIRouter, HTTPException
from models.users import User
from controllers.users import register
router = APIRouter()

@router.post("/register")
async def register_user(user: User):
    return await register(user)