from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from ..database import get_db
from ..models.notification import Notification
from ..models.user import User
from ..routers.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: str
    is_read: bool
    related_id: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Helper used by other routers ──────────────────────────
async def create_notification(
    db: AsyncSession,
    user_id: UUID,
    title: str,
    message: str,
    type: str = "info",
    related_id: Optional[str] = None,
):
    """Create a notification for a user. Best-effort — never raises."""
    try:
        n = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            related_id=related_id,
        )
        db.add(n)
        await db.flush()
    except Exception:
        pass


# ── Routes ────────────────────────────────────────────────

@router.get("", response_model=List[NotificationOut])
async def list_notifications(
    limit: int = 50,
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Notification).where(Notification.user_id == current_user.id)
    if unread_only:
        stmt = stmt.where(Notification.is_read == False)
    stmt = stmt.order_by(Notification.created_at.desc()).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/count")
async def unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import func
    result = await db.execute(
        select(func.count(Notification.id))
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
    )
    return {"unread": result.scalar() or 0}


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(
        update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == current_user.id)
        .values(is_read=True)
    )
    return {"ok": True}


@router.patch("/mark-all-read")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    return {"ok": True}
