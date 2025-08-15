from pydantic import BaseModel, Field
from datetime import date, datetime, timezone
from bson import ObjectId
from typing   import Optional, List
from enum import Enum

class Role (str, Enum):
    admin = "admin"
    customer = "customer"
    vendor = "vendor"
    
class Gender (str, Enum):
    male = "male"
    female =  "female"
    other = "other"
    
class User(BaseModel):
    firstname = str
    lastname = str
    middlename = str
    address = str
    barangay = str
    email = str
    password = str
    contact_no = str
    landline_no = str
    zipcode = str
    gender = Optional[Gender] = None
    img_path = Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    
    
    
class Config:
     arbitrary_types_allowed = True