import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name        = Column(String(255), nullable=False)
    email       = Column(String(255), nullable=False)
    message     = Column(Text, nullable=False)
    received_at = Column(DateTime, default=datetime.utcnow)
