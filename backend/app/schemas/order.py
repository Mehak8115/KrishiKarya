from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from typing import Literal


class OrderItemCreate(BaseModel):
    produce_id: UUID
    quantity: Decimal
    unit_price: Decimal


class OrderItemOut(BaseModel):
    id: UUID
    produce_id: Optional[UUID]
    quantity: Decimal
    unit_price: Decimal

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: Optional[str] = None


class OrderOut(BaseModel):
    id: UUID
    buyer_id: Optional[UUID]
    status: str
    total_amount: Decimal
    delivery_address: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "shipped", "delivered", "cancelled"]
