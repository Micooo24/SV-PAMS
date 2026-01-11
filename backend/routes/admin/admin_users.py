from fastapi import APIRouter, Query, Body
from typing import Optional

from controllers.admin.admin_users import (
    get_all_users,
    get_user_by_id,
    update_user_role,
    update_user_status,
    update_user_verification,
    update_user_details,
    delete_user
)

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


# Get single user by ID
@router.get("/{user_id}")
async def admin_get_user(user_id: str):
    return await get_user_by_id(user_id)


# Update user role
@router.put("/{user_id}/role")
async def admin_update_role(user_id: str, data: dict = Body(...)):
    new_role = data.get("role")
    if not new_role:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Role is required")
    return await update_user_role(user_id, new_role)


# Update user active status
@router.put("/{user_id}/status")
async def admin_update_status(user_id: str, data: dict = Body(...)):
    is_active = data.get("is_active")
    if is_active is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="is_active is required")
    return await update_user_status(user_id, is_active)


# Update user verification status
@router.put("/{user_id}/verification")
async def admin_update_verification(user_id: str, data: dict = Body(...)):
    is_verified = data.get("is_verified")
    if is_verified is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="is_verified is required")
    return await update_user_verification(user_id, is_verified)


# Update user details
@router.put("/{user_id}/details")
async def admin_update_details(user_id: str, data: dict = Body(...)):
    return await update_user_details(user_id, data)


# Delete user
@router.delete("/{user_id}")
async def admin_delete_user(user_id: str):
    return await delete_user(user_id)