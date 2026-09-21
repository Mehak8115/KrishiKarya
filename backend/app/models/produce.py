import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Numeric, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class Produce(Base):
    __tablename__ = "produce"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name_en    = Column(String(255), nullable=False)
    name_hi    = Column(String(255), nullable=True)
    icon       = Column(String(50), nullable=False, default="leaf")
    category   = Column(SAEnum("vegetable", "fruit", "grain", "spice", "other", name="produce_category"), nullable=False)
    farmer_id  = Column(UUID(as_uuid=True), ForeignKey("farmers.id", ondelete="SET NULL"), nullable=True)
    location   = Column(String(255), nullable=False)
    grade      = Column(SAEnum("A", "B", "C", name="produce_grade"), nullable=False, default="B")
    price      = Column(Numeric(10, 2), nullable=False)
    unit       = Column(SAEnum("per_kg", "per_qtl", "per_dozen", name="produce_unit"), nullable=False, default="per_kg")
    stock_kg   = Column(Numeric(12, 2), nullable=False, default=0)
    listed_at  = Column(DateTime, default=datetime.utcnow)
    is_active  = Column(Boolean, default=True)
