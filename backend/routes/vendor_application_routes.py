from fastapi import APIRouter, Depends
from controllers.vendor_application_controller import apply_as_vendor, get_vendor_application, update_vendor_application, activate_vendor_role
from controllers.admin.admin_vendor_carts import get_slot_availability, check_user_eligibility
from models.vendor_application_model import VendorApplicationCreate
from utils.utils import get_current_user

router = APIRouter()

# ==================== SLOT & ELIGIBILITY (Public for Mobile Users) ====================

@router.get("/slots/availability")
def get_slots_availability():
    """Get current slot availability for mobile users"""
    return get_slot_availability()

@router.get("/eligibility")
def check_eligibility(current_user=Depends(get_current_user)):
    """Check if current user is eligible to apply as vendor"""
    user_id = str(current_user.get("_id"))
    return check_user_eligibility(user_id)

# ==================== APPLICATION ROUTES ====================

@router.post("/apply")
def apply_vendor(
    data: VendorApplicationCreate,
    current_user=Depends(get_current_user)
):
    return apply_as_vendor(data, current_user)


@router.get("/application")
def fetch_vendor_application(current_user=Depends(get_current_user)):
    return get_vendor_application(current_user)


@router.put("/application")
def update_vendor(
    data: VendorApplicationCreate,
    current_user=Depends(get_current_user)
):
    return update_vendor_application(data, current_user)


@router.post("/activate")
def activate_vendor(current_user=Depends(get_current_user)):
    return activate_vendor_role(current_user)
