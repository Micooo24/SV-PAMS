from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from secrets_backend.controllers.firestore_monitor import log_user_interaction

router = APIRouter()

class UserInteractionRequest(BaseModel):
    user_id: str
    action: str
    user_lat: float
    user_lng: float
    timestamp: str = None  # Optional, ISO format

@router.post("/log-user-interaction")
def log_user_interaction_endpoint(payload: UserInteractionRequest):
    try:
        log_user_interaction(
            user_id=payload.user_id,
            action=payload.action,
            user_lat=payload.user_lat,
            user_lng=payload.user_lng,
            timestamp=payload.timestamp
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
