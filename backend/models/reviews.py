#Lei
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Review(BaseModel):
    cart_id: str           # Reference to Vendors Collection
    reviewer_user_id: str  # Reference to Users Collection
    rating: int
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
