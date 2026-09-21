from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class FarmerCreate(BaseModel):
    name: str
    phone: str
    location: str
    state: str


class FarmerOut(BaseModel):
    id: UUID
    name: str
    phone: str
    location: str
    state: str
    verified: bool
    joined_at: datetime

    model_config = {"from_attributes": True}
