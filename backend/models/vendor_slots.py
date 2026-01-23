from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime

class VendorSlotConfig(BaseModel):
    """Configuration for vendor slot availability"""
    max_slots: int = 100  # Maximum total vendor slots
    reserved_slots: int = 10  # Slots reserved for special cases
    area_slots: Dict[str, int] = {
        "Market": 50,
        "School": 30,
        "Streets": 40,
        "Mall": 20
    }
    is_accepting_applications: bool = True
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None

    def to_dict(self):
        return self.dict()


class SlotAvailability(BaseModel):
    """Response model for slot availability check"""
    total_slots: int
    used_slots: int
    available_slots: int
    reserved_slots: int
    is_accepting: bool
    area_availability: Dict[str, Dict[str, int]]  # area: {total, used, available}


class EligibilityCriteria(BaseModel):
    """Eligibility check result for vendor application"""
    is_eligible: bool
    criteria: Dict[str, bool]
    missing_requirements: list
    message: str


class VendorCartCreate(BaseModel):
    """Model for manually creating a vendor cart record"""
    user_id: str
    cart_registry_no: Optional[str] = None
    sanitary_email: Optional[str] = None
    is_pasig_cart: bool = False
    classification: Optional[str] = None
    confidence: Optional[float] = None
    status: str = "Pending"
    notes: Optional[str] = None


class VendorCartUpdate(BaseModel):
    """Model for updating a vendor cart record"""
    cart_registry_no: Optional[str] = None
    sanitary_email: Optional[str] = None
    is_pasig_cart: Optional[bool] = None
    classification: Optional[str] = None
    confidence: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    has_required_info: Optional[bool] = None
