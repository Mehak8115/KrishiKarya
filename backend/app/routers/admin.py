from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..database import get_db
from ..models.user import User
from ..models.farmer import Farmer
from ..models.produce import Produce
from ..models.order import Order
from ..models.ai_grade import AIQualityGrade
from ..schemas.user import UserOut
from ..routers.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


class UserToggle(BaseModel):
    is_active: bool


class PlatformStats(BaseModel):
    total_farmers: int
    total_retailers: int
    total_admins: int
    active_produce: int
    total_orders: int
    ai_inspections: int
    ai_today: int


@router.get("/stats", response_model=PlatformStats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(_require_admin),
):
    farmers_count   = (await db.execute(select(func.count()).where(User.role == "farmer"))).scalar()
    retailers_count = (await db.execute(select(func.count()).where(User.role == "retailer"))).scalar()
    admins_count    = (await db.execute(select(func.count()).where(User.role == "admin"))).scalar()
    active_produce  = (await db.execute(select(func.count()).where(Produce.is_active == True))).scalar()
    total_orders    = (await db.execute(select(func.count(Order.id)))).scalar()
    ai_total        = (await db.execute(select(func.count(AIQualityGrade.id)))).scalar()

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    ai_today    = (await db.execute(
        select(func.count(AIQualityGrade.id)).where(AIQualityGrade.analyzed_at >= today_start)
    )).scalar()

    return PlatformStats(
        total_farmers=farmers_count or 0,
        total_retailers=retailers_count or 0,
        total_admins=admins_count or 0,
        active_produce=active_produce or 0,
        total_orders=total_orders or 0,
        ai_inspections=ai_total or 0,
        ai_today=ai_today or 0,
    )


@router.get("/users", response_model=List[UserOut])
async def list_users(
    role: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(_require_admin),
):
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role)
    stmt = stmt.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.patch("/users/{user_id}", response_model=UserOut)
async def toggle_user(
    user_id: UUID,
    payload: UserToggle,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(_require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot modify admin users")
    user.is_active = payload.is_active
    await db.flush()
    await db.refresh(user)
    return user


@router.get("/ai-inspections")
async def list_ai_inspections(
    tool: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(_require_admin),
):
    stmt = select(AIQualityGrade)
    if tool:
        stmt = stmt.where(AIQualityGrade.tool == tool)
    stmt = stmt.order_by(AIQualityGrade.analyzed_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    rows = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "tool": r.tool,
            "grade_result": r.grade_result,
            "badge": r.badge,
            "confidence": r.confidence,
            "recommendation": r.recommendation,
            "analyzed_at": r.analyzed_at.isoformat() if r.analyzed_at else None,
            "user_id": str(r.user_id) if r.user_id else None,
        }
        for r in rows
    ]


@router.get("/produce")
async def list_all_produce(
    limit: int = 100,
    skip: int = 0,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(_require_admin),
):
    from ..models.farmer import Farmer
    from sqlalchemy.orm import outerjoin
    stmt = (
        select(Produce, Farmer.name.label("farmer_name"))
        .outerjoin(Farmer, Produce.farmer_id == Farmer.id)
        .order_by(Produce.listed_at.desc())
        .offset(skip).limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [
        {
            "id": str(r.Produce.id),
            "name_en": r.Produce.name_en,
            "name_hi": r.Produce.name_hi,
            "category": r.Produce.category,
            "grade": r.Produce.grade,
            "price": float(r.Produce.price),
            "unit": r.Produce.unit,
            "stock_kg": float(r.Produce.stock_kg),
            "location": r.Produce.location,
            "is_active": r.Produce.is_active,
            "farmer_name": r.farmer_name or "Unknown",
            "listed_at": r.Produce.listed_at.isoformat() if r.Produce.listed_at else None,
        }
        for r in rows
    ]


@router.patch("/produce/{produce_id}/toggle")
async def toggle_produce(
    produce_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(_require_admin),
):
    result = await db.execute(select(Produce).where(Produce.id == produce_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Produce not found")
    item.is_active = not item.is_active
    await db.flush()
    return {"id": str(item.id), "is_active": item.is_active}
