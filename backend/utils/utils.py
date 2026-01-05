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
from typing import Optional, Dict, Tuple

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Secret key for signing tokens
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")

# Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ===== In-Memory OTP Storage =====
# Format: {"email@gmail.com": {"otp": "123456", "expires_at": datetime}}
otp_storage: Dict[str, Dict[str, any]] = {}

def store_otp(email: str, otp_code: str, expires_at: datetime) -> None:
    """Store OTP in memory for an email"""
    otp_storage[email.lower().strip()] = {
        "otp": otp_code,
        "expires_at": expires_at
    }
    logger.info(f"OTP stored for {email}, expires at {expires_at}")

def get_otp(email: str) -> Optional[Dict[str, any]]:
    """Retrieve OTP data for an email"""
    return otp_storage.get(email.lower().strip())

def delete_otp(email: str) -> None:
    """Delete OTP after verification"""
    email_key = email.lower().strip()
    if email_key in otp_storage:
        del otp_storage[email_key]
        logger.info(f"OTP deleted for {email}")

def cleanup_expired_otps() -> None:
    """Clean up expired OTPs (optional - can be called periodically)"""
    current_time = datetime.utcnow()
    expired_emails = [
        email for email, data in otp_storage.items()
        if current_time > data["expires_at"]
    ]
    
    for email in expired_emails:
        del otp_storage[email]
        logger.info(f"Expired OTP cleaned up for {email}")

# ===== JWT Functions =====
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    logging.info(f"Token received: {token}")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logging.info(f"Payload decoded: {payload}")
        user_id: str = payload.get("sub")
        if user_id is None:
            logging.error("Invalid authentication credentials: user_id is None")
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        logging.info(f"Querying user with email: {user_id}")
        user = db["users"].find_one({"email": user_id})
        logging.info(f"Database query result: {user}")
        if user is None:
            logging.error(f"User not found: {user_id}")
            raise HTTPException(status_code=401, detail="User not found")
        
        logging.info(f"User authenticated: {user_id}")
        return {"_id": user["_id"]}
    except JWTError as e:
        logging.error(f"JWTError: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials") 

# ===== OTP Functions =====
def generate_otp() -> str:
    """Generate 6-digit OTP as string"""
    return str(random.randint(100000, 999999))

def get_otp_expiry() -> datetime:
    """Get OTP expiry time (10 minutes from now)"""
    return datetime.utcnow() + timedelta(minutes=10)

def verify_otp(stored_otp: str, stored_expiry: datetime, entered_otp: str) -> bool:
    """
    Verify if entered OTP matches stored OTP and hasn't expired
    
    Args:
        stored_otp: OTP stored in memory
        stored_expiry: Expiry datetime
        entered_otp: OTP entered by user
    
    Returns:
        True if OTP is valid and not expired, False otherwise
    """
    # Check if OTP expired
    if datetime.utcnow() > stored_expiry:
        logger.warning("OTP has expired")
        return False
    
    # Check if OTP matches
    if stored_otp != entered_otp:
        logger.warning("OTP does not match")
        return False
    
    return True

def send_verification_email(email: str, otp: str, user_name: str = "User") -> bool:
    """
    Send OTP verification email to user
    
    Args:
        email: Recipient email address
        otp: 6-digit OTP code
        user_name: User's first name (optional)
    
    Returns:
        True if email sent successfully, False otherwise
    """
    subject = "Your OTP Verification Code - SV PAMS"
    body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }}
            .email-header {{
                background: linear-gradient(135deg, #351742, #5e3967);
                color: #ffffff;
                padding: 30px;
                text-align: center;
            }}
            .email-header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .email-body {{
                padding: 40px 30px;
                text-align: center;
            }}
            .email-body h2 {{
                color: #351742;
                margin-bottom: 20px;
            }}
            .otp-box {{
                background-color: #f0f0f0;
                padding: 20px;
                border-radius: 8px;
                display: inline-block;
                margin: 20px 0;
            }}
            .otp-code {{
                font-size: 36px;
                font-weight: bold;
                color: #00cac9;
                letter-spacing: 8px;
                margin: 0;
            }}
            .warning {{
                color: #ff6b6b;
                font-size: 14px;
                margin-top: 20px;
            }}
            .footer {{
                background-color: #f9f9f9;
                padding: 20px;
                text-align: center;
                color: #888;
                font-size: 12px;
            }}
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
                <p>&copy; 2025 SV PAMS. All rights reserved.</p>
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
        
        logger.info(f"OTP email sent successfully to {email}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        return False