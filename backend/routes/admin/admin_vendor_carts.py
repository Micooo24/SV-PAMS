from fastapi import APIRouter, HTTPException, Body, Query
from controllers.admin.admin_vendor_carts import (
    fetch_vendor_carts,
    get_vendor_cart_by_id,
    create_vendor_cart,
    update_vendor_cart,
    update_vendor_cart_status,
    delete_vendor_cart,
    get_slot_config,
    update_slot_config,
    get_slot_availability,
    check_user_eligibility,
    check_cart_eligibility,
    get_vendor_cart_stats
)
from models.vendor_slots import VendorCartCreate, VendorCartUpdate

# Initialize router ONCE at the top
router = APIRouter()

# In-memory geofencing state (default: True)
geofencing_enabled = True

# ==================== GEOFENCING ====================

@router.get("/geofencing-state")
def get_geofencing_state():
    return {"enabled": geofencing_enabled}

@router.post("/set-geofencing-state")
def set_geofencing_state(state: dict):
    global geofencing_enabled
    geofencing_enabled = bool(state.get("enabled", True))
    return {"enabled": geofencing_enabled}

# ==================== SLOT CONFIGURATION ====================

@router.get("/slots/config")
def get_slots_config():
    """Get current slot configuration"""
    try:
        return get_slot_config()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/slots/config")
def update_slots_config(data: dict = Body(...)):
    """Update slot configuration (Admin only)"""
    try:
        admin_id = data.pop("admin_id", "admin")
        return update_slot_config(data, admin_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/slots/availability")
def get_slots_availability():
    """Get current slot availability statistics"""
    try:
        return get_slot_availability()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ELIGIBILITY CHECK ====================

@router.get("/eligibility/user/{user_id}")
def check_user_eligibility_endpoint(user_id: str):
    """Check if a user is eligible to apply as a vendor"""
    try:
        return check_user_eligibility(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/eligibility/cart/{cart_id}")
def check_cart_eligibility_endpoint(cart_id: str):
    """Check if a cart record is eligible for vendor application"""
    try:
        return check_cart_eligibility(cart_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== CRUD OPERATIONS ====================

@router.get("/get-all")
def get_vendor_carts(
    status: str = Query(None),
    is_pasig_cart: bool = Query(None),
    has_required_info: bool = Query(None),
    limit: int = Query(100),
    skip: int = Query(0)
):
    """Get all vendor carts with optional filters"""
    try:
        filters = {}
        if status:
            filters["status"] = status
        if is_pasig_cart is not None:
            filters["is_pasig_cart"] = is_pasig_cart
        if has_required_info is not None:
            filters["has_required_info"] = has_required_info
        
        result = fetch_vendor_carts(filters, limit, skip)
        # Return just records for backward compatibility
        return result["records"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
def list_vendor_carts(
    status: str = Query(None),
    is_pasig_cart: bool = Query(None),
    has_required_info: bool = Query(None),
    limit: int = Query(100),
    skip: int = Query(0)
):
    """Get all vendor carts with pagination info"""
    try:
        filters = {}
        if status:
            filters["status"] = status
        if is_pasig_cart is not None:
            filters["is_pasig_cart"] = is_pasig_cart
        if has_required_info is not None:
            filters["has_required_info"] = has_required_info
        
        return fetch_vendor_carts(filters, limit, skip)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
def get_stats():
    """Get vendor cart statistics"""
    try:
        return get_vendor_cart_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{cart_id}")
def get_cart_by_id(cart_id: str):
    """Get a single vendor cart by ID"""
    try:
        return get_vendor_cart_by_id(cart_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
def create_cart(data: VendorCartCreate):
    """Manually create a vendor cart record"""
    try:
        return create_vendor_cart(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{cart_id}")
def update_cart(cart_id: str, data: VendorCartUpdate):
    """Update a vendor cart record"""
    try:
        return update_vendor_cart(cart_id, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update-status/{cart_id}")
def update_status(cart_id: str, data: dict = Body(...)):
    """Update vendor cart status"""
    status = data.get("status")
    print(f"[DEBUG] Received update-status request: cart_id={cart_id}, status={status}")
    if not status:
        print("[DEBUG] Status missing in request body")
        raise HTTPException(status_code=400, detail="Status is required")
    try:
        result = update_vendor_cart_status(cart_id, status)
        print(f"[DEBUG] Update result: {result}")
        return result
    except Exception as e:
        print(f"[DEBUG] Exception in update_vendor_cart_status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{cart_id}")
def delete_cart(cart_id: str):
    """Delete a vendor cart record"""
    try:
        return delete_vendor_cart(cart_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))