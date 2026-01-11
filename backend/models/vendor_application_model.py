from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductItem(BaseModel):
    name: str
    category: str
    price: float

class SocialMediaHandles(BaseModel):
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    tiktok: Optional[str] = None

class VendorApplicationCreate(BaseModel):
    business_name: str
    goods_type: str
    cart_type: str
    operating_hours: Optional[str] = None
    area_of_operation: Optional[List[str]] = []
    delivery_capability: Optional[bool] = False
    products: Optional[List[ProductItem]] = []
    specialty_items: Optional[List[str]] = []
    preferred_contact: Optional[str] = None
    
    # New fields
    years_in_operation: Optional[int] = None
    social_media: Optional[SocialMediaHandles] = None
    business_logo_url: Optional[str] = None
    cart_image_url: Optional[str] = None
    vendor_photo_url: Optional[str] = None

class VendorApplicationResponse(BaseModel):
    id: str
    user_id: str
    business_name: str
    goods_type: str
    cart_type: str
    operating_hours: Optional[str]
    area_of_operation: Optional[List[str]]
    delivery_capability: Optional[bool]
    products: Optional[List[ProductItem]]
    specialty_items: Optional[List[str]]
    preferred_contact: Optional[str]
    years_in_operation: Optional[int]
    social_media: Optional[SocialMediaHandles]
    business_logo_url: Optional[str]
    cart_image_url: Optional[str]
    vendor_photo_url: Optional[str]
    status: str
    submitted_at: datetime
    completeness_percentage: Optional[int]
