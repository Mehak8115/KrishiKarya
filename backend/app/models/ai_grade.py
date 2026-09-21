import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from ..database import Base


class AIQualityGrade(Base):
    __tablename__ = "ai_quality_grades"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    produce_id     = Column(UUID(as_uuid=True), ForeignKey("produce.id", ondelete="SET NULL"), nullable=True)
    user_id        = Column(UUID(as_uuid=True), ForeignKey("users.id",   ondelete="SET NULL"), nullable=True)
    tool           = Column(String(20),  nullable=False)
    grade_result   = Column(String(10),  nullable=True)
    badge          = Column(String(10),  nullable=True)
    confidence     = Column(Integer,     nullable=True)
    detail         = Column(JSONB,       nullable=True)
    recommendation = Column(Text,        nullable=True)
    analyzed_at    = Column(DateTime,    default=datetime.utcnow)


class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    produce       = Column(String(100), nullable=False)
    forecast_data = Column(JSONB,       nullable=False)
    generated_at  = Column(DateTime,    default=datetime.utcnow)
