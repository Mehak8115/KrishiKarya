import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class EmailOTP(Base):
    __tablename__ = "email_otps"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email      = Column(String(255), nullable=False, index=True)
    otp_code   = Column(String(10), nullable=False)
    purpose    = Column(String(50), nullable=False, default="register")
    is_used    = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
