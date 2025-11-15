from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional

class OTP(BaseModel):
    email: str
    otp_code: str
    created_at: datetime
    expires_at: datetime
    is_verified: bool = False
    user_id: Optional[str] = None
    
    class Config:
        arbitrary_types_allowed = True
