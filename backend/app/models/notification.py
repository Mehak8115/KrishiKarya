import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title       = Column(String(255), nullable=False)
    message     = Column(Text, nullable=False)
    type        = Column(String(50), nullable=False, default="info")  # info|order|request|produce|system
    is_read     = Column(Boolean, default=False)
    related_id  = Column(String(100), nullable=True)   # order_id or produce_id for deep linking
    created_at  = Column(DateTime, default=datetime.utcnow)
