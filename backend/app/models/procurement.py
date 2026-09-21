import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    produce_id   = Column(UUID(as_uuid=True), ForeignKey("produce.id", ondelete="SET NULL"), nullable=True)
    retailer_id  = Column(UUID(as_uuid=True), ForeignKey("users.id",   ondelete="CASCADE"),  nullable=False, index=True)
    farmer_id    = Column(UUID(as_uuid=True), ForeignKey("users.id",   ondelete="SET NULL"),  nullable=True,  index=True)
    produce_name = Column(String(255), nullable=False)
    quantity     = Column(Numeric(12,2), default=100)
    price        = Column(Numeric(10,2), default=0)
    status       = Column(String(30), nullable=False, default="pending", index=True)
    message      = Column(Text, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
