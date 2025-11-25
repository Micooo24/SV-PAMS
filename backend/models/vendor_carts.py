from pydantic import BaseModel
from typing import Dict, List, Optional

class VendorCart(BaseModel):
    user_id: str  
    original_image_url: str  
    postprocessed_image_url: str  
    predictions: List[Dict]  
    classification: str
    confidence: float
    timestamp: str  

    def to_dict(self):
        return self.dict()
    