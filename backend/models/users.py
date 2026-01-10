from pydantic import BaseModel, Field, EmailStr, validator
from datetime import date, datetime, timezone
from typing import Optional
from enum import Enum

class Role(str, Enum):
    superadmin = "superadmin"
    admin = "admin"
    vendor = "vendor"
    user = "user"
    sanitary = "sanitary"
    
class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

# Main User Model (for validation & database)
class User(BaseModel):
    firstname: str
    lastname: str
    middlename: str = ""
    address: str = ""
    barangay: str = ""
    email: EmailStr
    password: str
    birthday: str = ""  
    age: int = 0
    mobile_no: int = 0
    landline_no: str = ""
    zip_code: int = 0
    gender: Optional[Gender] = None
    img: Optional[str] = None
    role: Role = Role.user
    is_active: bool = True 
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None  
    fcm_token: Optional[str] = None  
    
    @validator('email')
    def email_must_be_gmail(cls, v):
        if not v.endswith('@gmail.com'):
            raise ValueError('Only Gmail accounts are allowed')
        return v.lower()
    
    class Config:
        arbitrary_types_allowed = True

# Response Model (NO PASSWORD - Required for security!)
class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    firstname: str
    lastname: str
    middlename: str = ""
    email: str
    role: Role
    img: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    mobile_no: Optional[int] = None
    address: Optional[str] = None
    barangay: Optional[str] = None
    
    class Config:
        populate_by_name = True