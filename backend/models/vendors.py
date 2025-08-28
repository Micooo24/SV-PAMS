#Lei
from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, List

class Achievement(BaseModel):
    title: str
    issued_by: str
    date: date

class Participation(BaseModel):
    event_name: str
    date: date
    role: str

class Ratings(BaseModel):
    average: float = 0.0
    total_reviews: int = 0

class Vendor(BaseModel):
    cart_id: str
    user_id: str  # Reference to Users Collection
    business_name: str
    location: str
    status: str 
    registration_date: date
    ratings: Optional[Ratings] = Ratings()
    achievements: Optional[List[Achievement]] = []
    participation: Optional[List[Participation]] = []

    class Config:
        arbitrary_types_allowed = True
