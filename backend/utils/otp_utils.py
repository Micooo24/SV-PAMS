import random
import string
from datetime import datetime, timedelta, timezone
from config.db import db
from config.email_config import send_otp_email

def generate_otp(length: int = 6) -> str:
    """Generate a random OTP"""
    return ''.join(random.choices(string.digits, k=length))

def create_otp(email: str, user_id: str = None) -> str:
    """Create and store OTP in database"""
    otp_code = generate_otp()
    created_at = datetime.now(timezone.utc)
    expires_at = created_at + timedelta(minutes=5)
    
    # Delete any existing OTPs for this email
    db["otps"].delete_many({"email": email})
    
    otp_data = {
        "email": email,
        "otp_code": otp_code,
        "created_at": created_at.isoformat(),
        "expires_at": expires_at.isoformat(),
        "is_verified": False,
        "user_id": user_id
    }
    
    db["otps"].insert_one(otp_data)
    return otp_code

def verify_otp(email: str, otp_code: str) -> bool:
    """Verify OTP code"""
    otp_record = db["otps"].find_one({
        "email": email,
        "otp_code": otp_code,
        "is_verified": False
    })
    
    if not otp_record:
        return False
    
    expires_at = datetime.fromisoformat(otp_record["expires_at"])
    
    if datetime.now(timezone.utc) > expires_at:
        db["otps"].delete_one({"_id": otp_record["_id"]})
        return False
    
    # Mark as verified
    db["otps"].update_one(
        {"_id": otp_record["_id"]},
        {"$set": {"is_verified": True}}
    )
    
    return True

def cleanup_expired_otps():
    """Remove expired OTPs"""
    current_time = datetime.now(timezone.utc).isoformat()
    db["otps"].delete_many({"expires_at": {"$lt": current_time}})
