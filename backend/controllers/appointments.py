from fastapi import HTTPException, status
from typing import List, Optional, Dict
from datetime import datetime, date, time, timedelta
import uuid
from models.appointments import (
    Appointment,
    AppointmentSlot,
    AppointmentRequest,
    AppointmentUpdate,
    AppointmentStatus,
    AppointmentType,
    TimeSlot,
    CalendarView,
    AppointmentResponse
)

# Mock database - replace with actual database operations
appointments_db: Dict[str, Appointment] = {}
appointment_slots_db: Dict[str, AppointmentSlot] = {}

# Default time slots configuration
DEFAULT_TIME_SLOTS = [
    TimeSlot(start_time=time(8, 0), end_time=time(9, 0)),
    TimeSlot(start_time=time(9, 0), end_time=time(10, 0)),
    TimeSlot(start_time=time(10, 0), end_time=time(11, 0)),
    TimeSlot(start_time=time(11, 0), end_time=time(12, 0)),
    TimeSlot(start_time=time(13, 0), end_time=time(14, 0)),
    TimeSlot(start_time=time(14, 0), end_time=time(15, 0)),
    TimeSlot(start_time=time(15, 0), end_time=time(16, 0)),
    TimeSlot(start_time=time(16, 0), end_time=time(17, 0)),
]

async def initialize_appointment_slots(start_date: date, end_date: date):
    """Initialize appointment slots for a date range"""
    current_date = start_date
    while current_date <= end_date:
        # Skip weekends
        if current_date.weekday() < 5:  # Monday=0, Friday=4
            for time_slot in DEFAULT_TIME_SLOTS:
                for appointment_type in AppointmentType:
                    slot_id = str(uuid.uuid4())
                    slot = AppointmentSlot(
                        id=slot_id,
                        date=current_date,
                        time_slot=time_slot,
                        appointment_type=appointment_type,
                        status=AppointmentStatus.AVAILABLE,
                        max_capacity=3 if appointment_type == AppointmentType.CONSULTATION else 1,
                        created_at=datetime.now()
                    )
                    appointment_slots_db[slot_id] = slot
        current_date += timedelta(days=1)

async def get_available_slots(
    start_date: date,
    end_date: date,
    appointment_type: Optional[AppointmentType] = None
) -> List[AppointmentSlot]:
    """Get available appointment slots within date range"""
    available_slots = []
    
    for slot in appointment_slots_db.values():
        if (start_date <= slot.date <= end_date and
            slot.status == AppointmentStatus.AVAILABLE and
            slot.current_bookings < slot.max_capacity):
            
            if appointment_type is None or slot.appointment_type == appointment_type:
                available_slots.append(slot)
    
    return sorted(available_slots, key=lambda x: (x.date, x.time_slot.start_time))

async def get_calendar_view(target_date: date) -> CalendarView:
    """Get calendar view for a specific date"""
    available_slots = []
    booked_slots = []
    
    for slot in appointment_slots_db.values():
        if slot.date == target_date:
            if slot.status == AppointmentStatus.AVAILABLE and slot.current_bookings < slot.max_capacity:
                available_slots.append(slot.time_slot)
            elif slot.current_bookings > 0:
                booked_appointments = [
                    {
                        "time_slot": slot.time_slot,
                        "appointment_type": slot.appointment_type,
                        "bookings": slot.current_bookings,
                        "capacity": slot.max_capacity
                    }
                ]
                booked_slots.extend(booked_appointments)
    
    return CalendarView(
        date=target_date,
        available_slots=available_slots,
        booked_slots=booked_slots,
        total_slots=len(list(filter(lambda s: s.date == target_date, appointment_slots_db.values()))),
        available_count=len(available_slots)
    )

async def book_appointment(user_id: str, appointment_request: AppointmentRequest) -> AppointmentResponse:
    """Book an appointment"""
    # Check if slot exists and is available
    slot = appointment_slots_db.get(appointment_request.appointment_slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Appointment slot not found")
    
    if slot.status != AppointmentStatus.AVAILABLE or slot.current_bookings >= slot.max_capacity:
        raise HTTPException(status_code=400, detail="Appointment slot is not available")
    
    # Check if user already has an appointment on the same date
    user_appointments = [app for app in appointments_db.values() 
                        if app.user_id == user_id and app.status == AppointmentStatus.BOOKED]
    
    for existing_app in user_appointments:
        existing_slot = appointment_slots_db.get(existing_app.appointment_slot_id)
        if existing_slot and existing_slot.date == slot.date:
            raise HTTPException(status_code=400, detail="You already have an appointment on this date")
    
    # Create appointment
    appointment_id = str(uuid.uuid4())
    appointment = Appointment(
        id=appointment_id,
        user_id=user_id,
        appointment_slot_id=appointment_request.appointment_slot_id,
        appointment_type=appointment_request.appointment_type,
        purpose=appointment_request.purpose,
        notes=appointment_request.notes,
        vendor_name=appointment_request.vendor_name,
        vendor_email=appointment_request.vendor_email,
        vendor_phone=appointment_request.vendor_phone,
        permit_application_id=appointment_request.permit_application_id,
        created_at=datetime.now()
    )
    
    appointments_db[appointment_id] = appointment
    
    # Update slot booking count
    slot.current_bookings += 1
    if slot.current_bookings >= slot.max_capacity:
        slot.status = AppointmentStatus.BOOKED
    slot.updated_at = datetime.now()
    
    return AppointmentResponse(
        id=appointment.id,
        user_id=appointment.user_id,
        appointment_date=slot.date,
        appointment_time=slot.time_slot,
        appointment_type=appointment.appointment_type,
        purpose=appointment.purpose,
        notes=appointment.notes,
        status=appointment.status,
        vendor_name=appointment.vendor_name,
        vendor_email=appointment.vendor_email,
        vendor_phone=appointment.vendor_phone,
        permit_application_id=appointment.permit_application_id,
        created_at=appointment.created_at,
        updated_at=appointment.updated_at
    )

async def get_user_appointments(user_id: str, status_filter: Optional[AppointmentStatus] = None) -> List[AppointmentResponse]:
    """Get user's appointments"""
    user_appointments = []
    
    for appointment in appointments_db.values():
        if appointment.user_id == user_id:
            if status_filter is None or appointment.status == status_filter:
                slot = appointment_slots_db.get(appointment.appointment_slot_id)
                if slot:
                    response = AppointmentResponse(
                        id=appointment.id,
                        user_id=appointment.user_id,
                        appointment_date=slot.date,
                        appointment_time=slot.time_slot,
                        appointment_type=appointment.appointment_type,
                        purpose=appointment.purpose,
                        notes=appointment.notes,
                        status=appointment.status,
                        vendor_name=appointment.vendor_name,
                        vendor_email=appointment.vendor_email,
                        vendor_phone=appointment.vendor_phone,
                        permit_application_id=appointment.permit_application_id,
                        created_at=appointment.created_at,
                        updated_at=appointment.updated_at
                    )
                    user_appointments.append(response)
    
    return sorted(user_appointments, key=lambda x: x.appointment_date, reverse=True)

async def update_appointment(
    appointment_id: str,
    user_id: str,
    appointment_update: AppointmentUpdate
) -> AppointmentResponse:
    """Update appointment details"""
    appointment = appointments_db.get(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if appointment.status not in [AppointmentStatus.BOOKED]:
        raise HTTPException(status_code=400, detail="Cannot update this appointment")
    
    # Update fields
    update_data = appointment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    appointment.updated_at = datetime.now()
    
    slot = appointment_slots_db.get(appointment.appointment_slot_id)
    return AppointmentResponse(
        id=appointment.id,
        user_id=appointment.user_id,
        appointment_date=slot.date,
        appointment_time=slot.time_slot,
        appointment_type=appointment.appointment_type,
        purpose=appointment.purpose,
        notes=appointment.notes,
        status=appointment.status,
        vendor_name=appointment.vendor_name,
        vendor_email=appointment.vendor_email,
        vendor_phone=appointment.vendor_phone,
        permit_application_id=appointment.permit_application_id,
        created_at=appointment.created_at,
        updated_at=appointment.updated_at
    )

async def cancel_appointment(appointment_id: str, user_id: str, cancellation_reason: str) -> dict:
    """Cancel an appointment"""
    appointment = appointments_db.get(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if appointment.status != AppointmentStatus.BOOKED:
        raise HTTPException(status_code=400, detail="Cannot cancel this appointment")
    
    # Update appointment status
    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancelled_at = datetime.now()
    appointment.cancellation_reason = cancellation_reason
    appointment.updated_at = datetime.now()
    
    # Update slot availability
    slot = appointment_slots_db.get(appointment.appointment_slot_id)
    if slot:
        slot.current_bookings -= 1
        if slot.current_bookings < slot.max_capacity:
            slot.status = AppointmentStatus.AVAILABLE
        slot.updated_at = datetime.now()
    
    return {"message": "Appointment cancelled successfully"}

async def get_all_appointments(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status_filter: Optional[AppointmentStatus] = None
) -> List[AppointmentResponse]:
    """Get all appointments (admin function)"""
    all_appointments = []
    
    for appointment in appointments_db.values():
        slot = appointment_slots_db.get(appointment.appointment_slot_id)
        if slot:
            # Apply date filters
            if start_date and slot.date < start_date:
                continue
            if end_date and slot.date > end_date:
                continue
            
            # Apply status filter
            if status_filter and appointment.status != status_filter:
                continue
            
            response = AppointmentResponse(
                id=appointment.id,
                user_id=appointment.user_id,
                appointment_date=slot.date,
                appointment_time=slot.time_slot,
                appointment_type=appointment.appointment_type,
                purpose=appointment.purpose,
                notes=appointment.notes,
                status=appointment.status,
                vendor_name=appointment.vendor_name,
                vendor_email=appointment.vendor_email,
                vendor_phone=appointment.vendor_phone,
                permit_application_id=appointment.permit_application_id,
                created_at=appointment.created_at,
                updated_at=appointment.updated_at
            )
            all_appointments.append(response)
    
    return sorted(all_appointments, key=lambda x: x.appointment_date, reverse=True)
