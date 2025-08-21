from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import date, datetime, timedelta

from controllers.appointments import (
    get_available_slots,
    get_calendar_view,
    book_appointment,
    get_user_appointments,
    update_appointment,
    cancel_appointment,
    get_all_appointments,
    initialize_appointment_slots
)
from models.appointments import (
    AppointmentRequest,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentStatus,
    AppointmentType,
    CalendarView,
    AppointmentSlot
)

router = APIRouter()

@router.post("/initialize-slots", status_code=status.HTTP_201_CREATED)
async def create_appointment_slots(
    start_date: date = Query(..., description="Start date for slot creation"),
    end_date: date = Query(..., description="End date for slot creation"),
    admin_user: str = Depends(lambda: "admin_user_id")  # Replace with actual admin auth
):
    """Initialize appointment slots for a date range (admin only)"""
    try:
        if end_date < start_date:
            raise HTTPException(status_code=400, detail="End date must be after start date")
        
        if (end_date - start_date).days > 90:
            raise HTTPException(status_code=400, detail="Date range cannot exceed 90 days")
        
        await initialize_appointment_slots(start_date, end_date)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"message": f"Appointment slots created from {start_date} to {end_date}"}
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/available-slots", response_model=List[AppointmentSlot])
async def get_available_appointment_slots(
    start_date: date = Query(..., description="Start date for availability search"),
    end_date: date = Query(..., description="End date for availability search"),
    appointment_type: Optional[AppointmentType] = Query(None, description="Filter by appointment type"),
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth
):
    """Get available appointment slots"""
    try:
        if end_date < start_date:
            raise HTTPException(status_code=400, detail="End date must be after start date")
        
        if start_date < date.today():
            raise HTTPException(status_code=400, detail="Cannot book appointments for past dates")
        
        slots = await get_available_slots(start_date, end_date, appointment_type)
        return slots
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendar/{target_date}", response_model=CalendarView)
async def get_calendar_for_date(
    target_date: date,
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth
):
    """Get calendar view for a specific date"""
    try:
        if target_date < date.today():
            raise HTTPException(status_code=400, detail="Cannot view calendar for past dates")
        
        calendar_view = await get_calendar_view(target_date)
        return calendar_view
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/book", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_request: AppointmentRequest,
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth
):
    """Book a new appointment"""
    try:
        appointment = await book_appointment(user_id, appointment_request)
        return appointment
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-appointments", response_model=List[AppointmentResponse])
async def get_my_appointments(
    status_filter: Optional[AppointmentStatus] = Query(None, description="Filter by appointment status"),
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth
):
    """Get current user's appointments"""
    try:
        appointments = await get_user_appointments(user_id, status_filter)
        return appointments
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_my_appointment(
    appointment_id: str,
    appointment_update: AppointmentUpdate,
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth
):
    """Update appointment details"""
    try:
        updated_appointment = await update_appointment(appointment_id, user_id, appointment_update)
        return updated_appointment
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{appointment_id}/cancel")
async def cancel_my_appointment(
    appointment_id: str,
    cancellation_reason: str = Query(..., description="Reason for cancellation"),
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth
):
    """Cancel an appointment"""
    try:
        result = await cancel_appointment(appointment_id, user_id, cancellation_reason)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/all", response_model=List[AppointmentResponse])
async def get_all_appointments_admin(
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    status_filter: Optional[AppointmentStatus] = Query(None, description="Filter by status"),
    admin_user: str = Depends(lambda: "admin_user_id")  # Replace with actual admin auth
):
    """Get all appointments (admin only)"""
    try:
        appointments = await get_all_appointments(start_date, end_date, status_filter)
        return appointments
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/types", response_model=List[str])
async def get_appointment_types():
    """Get available appointment types"""
    return [appointment_type.value for appointment_type in AppointmentType]

@router.get("/status-options", response_model=List[str])
async def get_appointment_status_options():
    """Get available appointment status options"""
    return [status.value for status in AppointmentStatus]

@router.get("/upcoming", response_model=List[AppointmentResponse])
async def get_upcoming_appointments(
    days_ahead: int = Query(7, description="Number of days to look ahead"),
    user_id: str = Depends(lambda: "current_user_id")  # Replace with actual auth
):
    """Get user's upcoming appointments"""
    try:
        end_date = date.today() + timedelta(days=days_ahead)
        appointments = await get_user_appointments(user_id, AppointmentStatus.BOOKED)
        
        # Filter for upcoming appointments only
        upcoming = [
            app for app in appointments 
            if app.appointment_date >= date.today() and app.appointment_date <= end_date
        ]
        
        return sorted(upcoming, key=lambda x: x.appointment_date)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
