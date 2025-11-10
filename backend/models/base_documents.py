from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional
from enum import Enum

class DocumentCategory(str, Enum):
    permits = "permits"
    clearances = "clearances"
    certificates = "certificates"
    requirements = "requirements"
    ids = "ids"
    licenses = "licenses"
    general = "general"

class BaseDocument(BaseModel):
    title: str
    filename: str
    file_type: str
    file_url: str
    category: DocumentCategory
    description: Optional[str] = ""
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    
    class Config:
        arbitrary_types_allowed = True