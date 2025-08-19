from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum

class AppointmentStatus(str, Enum):
    AVAILABLE = "available"
    BOOKED = "booked"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"

class AppointmentType(str, Enum):
    CONSULTATION = "consultation"
    PERMIT_REVIEW = "permit_review"
    SITE_INSPECTION = "site_inspection"
    DOCUMENT_SUBMISSION = "document_submission"
    FOLLOW_UP = "follow_up"

class TimeSlot(BaseModel):
    start_time: time
    end_time: time
    is_available: bool = True

class AppointmentSlot(BaseModel):
    id: Optional[str] = None
    date: date
    time_slot: TimeSlot
    appointment_type: AppointmentType
    status: AppointmentStatus = AppointmentStatus.AVAILABLE
    max_capacity: int = 1
    current_bookings: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Appointment(BaseModel):
    id: Optional[str] = None
    user_id: str
    appointment_slot_id: str
    appointment_type: AppointmentType
    purpose: str
    notes: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.BOOKED
    vendor_name: str
    vendor_email: str
    vendor_phone: str
    permit_application_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None

class AppointmentRequest(BaseModel):
    appointment_slot_id: str
    appointment_type: AppointmentType
    purpose: str
    notes: Optional[str] = None
    vendor_name: str
    vendor_email: str
    vendor_phone: str
    permit_application_id: Optional[str] = None

class AppointmentUpdate(BaseModel):
    purpose: Optional[str] = None
    notes: Optional[str] = None
    vendor_name: Optional[str] = None
    vendor_email: Optional[str] = None
    vendor_phone: Optional[str] = None

class CalendarView(BaseModel):
    date: date
    available_slots: List[TimeSlot]
    booked_slots: List[dict]
    total_slots: int
    available_count: int

class AppointmentResponse(BaseModel):
    id: str
    user_id: str
    appointment_date: date
    appointment_time: TimeSlot
    appointment_type: AppointmentType
    purpose: str
    notes: Optional[str] = None
    status: AppointmentStatus
    vendor_name: str
    vendor_email: str
    vendor_phone: str
    permit_application_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
