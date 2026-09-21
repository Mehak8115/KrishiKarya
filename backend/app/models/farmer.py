import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name      = Column(String(255), nullable=False)
    phone     = Column(String(20), unique=True, nullable=False)
    location  = Column(String(255), nullable=False)
    state     = Column(String(100), nullable=False)
    verified  = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    user_id   = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
