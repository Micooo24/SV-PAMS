from fastapi import HTTPException, Query, Body
from typing import Optional
import logging
from datetime import datetime

from config.db import db
from bson import ObjectId
from models.users import UserResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Get All Users with Filters and Pagination
async def get_all_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    role: Optional[str] = Query(None, description="Filter by role (user, vendor, admin)"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_verified: Optional[bool] = Query(None, description="Filter by verification status"),
    search: Optional[str] = Query(None, description="Search by name or email")
):
    """
    Get all users with optional filters and pagination (Admin only)
    """
    try:
        # Build query filter
        query_filter = {}
        
        if role:
            query_filter["role"] = role.lower()
        
        if is_active is not None:
            query_filter["is_active"] = is_active
        
        if is_verified is not None:
            query_filter["is_verified"] = is_verified
        
        # Search by name or email
        if search:
            query_filter["$or"] = [
                {"firstname": {"$regex": search, "$options": "i"}},
                {"lastname": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        
        # Get total count before pagination
        total_users = db["users"].count_documents(query_filter)
        
        # Get paginated users
        users = list(
            db["users"]
            .find(query_filter)
            .skip(skip)
            .limit(limit)
            .sort("created_at", -1)  # Newest first
        )
        
        # Convert ObjectId to string for each user
        for user in users:
            user["_id"] = str(user["_id"])
        
        logger.info(f"Retrieved {len(users)} users out of {total_users} total")
        
        return {
            "message": "Users retrieved successfully",
            "total": total_users,
            "count": len(users),
            "skip": skip,
            "limit": limit,
            "users": [UserResponse(**user) for user in users]
        }
    
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Get Single User by ID
async def get_user_by_id(user_id: str):
    """
    Get a single user by ID
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user["_id"] = str(user["_id"])
        
        return UserResponse(**user)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Update User Role
async def update_user_role(user_id: str, new_role: str):
    """
    Update user role (user, vendor, admin)
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        # Validate role
        valid_roles = ["user", "vendor", "admin"]
        if new_role.lower() not in valid_roles:
            raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")
        
        result = db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "role": new_role.lower(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"Updated role for user {user_id} to {new_role}")
        
        return {
            "message": "User role updated successfully",
            "user_id": user_id,
            "new_role": new_role.lower()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user role: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Update User Active Status
async def update_user_status(user_id: str, is_active: bool):
    """
    Activate or deactivate a user account
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        result = db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "is_active": is_active,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        status_text = "activated" if is_active else "deactivated"
        logger.info(f"User {user_id} has been {status_text}")
        
        return {
            "message": f"User {status_text} successfully",
            "user_id": user_id,
            "is_active": is_active
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Update User Verification Status
async def update_user_verification(user_id: str, is_verified: bool):
    """
    Verify or unverify a user account
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        result = db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "is_verified": is_verified,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        status_text = "verified" if is_verified else "unverified"
        logger.info(f"User {user_id} has been {status_text}")
        
        return {
            "message": f"User {status_text} successfully",
            "user_id": user_id,
            "is_verified": is_verified
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user verification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Update User Details
async def update_user_details(user_id: str, update_data: dict):
    """
    Update user profile details
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        # Fields that can be updated
        allowed_fields = [
            "firstname", "lastname", "middlename", "address", "barangay",
            "birthday", "age", "mobile_no", "landline_no", "zip_code", "gender"
        ]
        
        # Filter only allowed fields
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        if not filtered_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        filtered_data["updated_at"] = datetime.utcnow()
        
        result = db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": filtered_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"Updated details for user {user_id}")
        
        return {
            "message": "User details updated successfully",
            "user_id": user_id,
            "updated_fields": list(filtered_data.keys())
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Delete User
async def delete_user(user_id: str):
    """
    Delete a user account (soft delete recommended)
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        # Soft delete: mark as inactive instead of hard delete
        result = db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "is_active": False,
                    "is_deleted": True,
                    "deleted_at": datetime.utcnow()
                }
            }
        )
        
        # For hard delete, use:
        # result = db["users"].delete_one({"_id": ObjectId(user_id)})
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"User {user_id} has been deleted")
        
        return {
            "message": "User deleted successfully",
            "user_id": user_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))