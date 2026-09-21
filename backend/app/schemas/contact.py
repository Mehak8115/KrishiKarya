from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    message: str


class ContactMessageOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    message: str
    received_at: datetime

    model_config = {"from_attributes": True}
