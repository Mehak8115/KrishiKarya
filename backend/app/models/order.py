import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database import Base


class Order(Base):
    __tablename__ = "orders"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_id         = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status           = Column(
        SAEnum("pending", "confirmed", "shipped", "delivered", "cancelled", name="order_status"),
        nullable=False, default="pending"
    )
    total_amount     = Column(Numeric(12, 2), nullable=False, default=0)
    delivery_address = Column(String(500), nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)
    updated_at       = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id   = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    produce_id = Column(UUID(as_uuid=True), ForeignKey("produce.id", ondelete="SET NULL"), nullable=True)
    quantity   = Column(Numeric(12, 2), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
