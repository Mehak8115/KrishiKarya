from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from decimal import Decimal
from typing import Literal


class ProduceCreate(BaseModel):
    name_en: str
    name_hi: Optional[str] = None
    icon: str = "leaf"
    category: Literal["vegetable", "fruit", "grain", "spice", "other"]
    farmer_id: Optional[UUID] = None
    location: str
    grade: Literal["A", "B", "C"] = "B"
    price: Decimal
    unit: Literal["per_kg", "per_qtl", "per_dozen"] = "per_kg"
    stock_kg: Decimal = Decimal("0")


class ProduceUpdate(BaseModel):
    name_en: Optional[str] = None
    name_hi: Optional[str] = None
    grade: Optional[Literal["A", "B", "C"]] = None
    price: Optional[Decimal] = None
    stock_kg: Optional[Decimal] = None
    is_active: Optional[bool] = None


class ProduceOut(BaseModel):
    id: UUID
    name_en: str
    name_hi: Optional[str]
    icon: str
    category: str
    farmer_id: Optional[UUID]
    location: str
    grade: str
    price: Decimal
    unit: str
    stock_kg: Decimal
    listed_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}
