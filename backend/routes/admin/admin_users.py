from fastapi import APIRouter, Query
from typing import Optional

from controllers.admin.admin_users import get_all_users

router = APIRouter()

# Get all users with filters
@router.get("/get-all")
async def admin_get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_verified: Optional[bool] = None,
    search: Optional[str] = None
):
    return await get_all_users(skip, limit, role, is_active, is_verified, search)