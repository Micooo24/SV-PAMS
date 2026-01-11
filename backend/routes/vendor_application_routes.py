from fastapi import APIRouter, Depends
from controllers.vendor_application_controller import apply_as_vendor, get_vendor_application, update_vendor_application, activate_vendor_role
from models.vendor_application_model import VendorApplicationCreate
from utils.utils import get_current_user

router = APIRouter()

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
