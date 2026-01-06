from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from config.db import db
from bson import ObjectId
import logging
import os 
from dotenv import load_dotenv
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import random
from typing import Optional, Dict

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
SMTP_SERVER = os.getenv("EMAIL_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("EMAIL_PORT", 587))
SENDER_EMAIL = os.getenv("EMAIL_HOST_USER")
SENDER_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# In-Memory OTP Storage
otp_storage: Dict[str, Dict[str, any]] = {}

# ===== OTP Storage Functions =====
def store_otp(email: str, otp_code: str, expires_at: datetime) -> None:
    """Store OTP in memory"""
    otp_storage[email.lower().strip()] = {
        "otp": otp_code,
        "expires_at": expires_at
    }

def get_otp(email: str) -> Optional[Dict[str, any]]:
    """Retrieve OTP data"""
    return otp_storage.get(email.lower().strip())

def delete_otp(email: str) -> None:
    """Delete OTP after verification"""
    email_key = email.lower().strip()
    if email_key in otp_storage:
        del otp_storage[email_key]

def cleanup_expired_otps() -> None:
    """Clean up expired OTPs"""
    current_time = datetime.utcnow()
    expired = [e for e, d in otp_storage.items() if current_time > d["expires_at"]]
    for email in expired:
        del otp_storage[email]

# ===== JWT Functions =====
def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=1))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current authenticated user"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        user = db["users"].find_one({"email": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return {"_id": user["_id"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# ===== OTP Functions =====
def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return str(random.randint(100000, 999999))

def get_otp_expiry() -> datetime:
    """Get OTP expiry time (10 minutes)"""
    return datetime.utcnow() + timedelta(minutes=10)

def verify_otp_code(stored_otp: str, stored_expiry: datetime, entered_otp: str) -> bool:
    """Verify OTP"""
    if datetime.utcnow() > stored_expiry:
        return False
    return stored_otp == entered_otp

def send_verification_email(email: str, otp: str, user_name: str = "User") -> bool:
    """Send OTP verification email"""
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        logger.error("Email configuration missing in .env file")
        return False
    
    subject = "Your OTP Verification Code - SV PAMS"
    body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }}
            .email-container {{ max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden; }}
            .email-header {{ background: linear-gradient(135deg, #351742, #5e3967); color: #ffffff; padding: 30px; text-align: center; }}
            .email-header h1 {{ margin: 0; font-size: 24px; }}
            .email-body {{ padding: 40px 30px; text-align: center; }}
            .email-body h2 {{ color: #351742; margin-bottom: 20px; }}
            .otp-box {{ background-color: #f0f0f0; padding: 20px; border-radius: 8px; display: inline-block; margin: 20px 0; }}
            .otp-code {{ font-size: 36px; font-weight: bold; color: #00cac9; letter-spacing: 8px; margin: 0; }}
            .warning {{ color: #ff6b6b; font-size: 14px; margin-top: 20px; }}
            .footer {{ background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Welcome to SV PAMS!</h1>
            </div>
            <div class="email-body">
                <h2>Hi {user_name},</h2>
                <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
                <div class="otp-box">
                    <p class="otp-code">{otp}</p>
                </div>
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                <p class="warning">⚠️ Do not share this code with anyone.</p>
            </div>
            <div class="footer">
                <p>If you didn't request this code, please ignore this email.</p>
                <p>&copy; 2026 SV PAMS. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, email, msg.as_string())
        
        logger.info(f"OTP email sent to {email}")
        return True
    
    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP Authentication failed - check EMAIL_HOST_PASSWORD (use Gmail App Password)")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False