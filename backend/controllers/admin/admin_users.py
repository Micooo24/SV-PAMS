from fastapi import HTTPException, Query
from typing import Optional
import logging

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