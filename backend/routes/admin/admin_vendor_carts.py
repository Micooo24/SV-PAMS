
from fastapi import APIRouter, HTTPException
from controllers.admin.admin_vendor_carts import fetch_vendor_carts, update_vendor_cart_status

# PATCH endpoint to update status
from fastapi import Body

router = APIRouter()

@router.put("/update-status/{cart_id}")
def update_status(cart_id: str, data: dict = Body(...)):
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

router = APIRouter()

# In-memory geofencing state (default: True)
geofencing_enabled = True

@router.get("/geofencing-state")
def get_geofencing_state():
    return {"enabled": geofencing_enabled}

@router.post("/set-geofencing-state")
def set_geofencing_state(state: dict):
    global geofencing_enabled
    geofencing_enabled = bool(state.get("enabled", True))
    return {"enabled": geofencing_enabled}

@router.get("/get-all")
def get_vendor_carts():
    try:
        return fetch_vendor_carts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))