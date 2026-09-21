"""
Procurement Requests — Retailer sends → Farmer sees + accepts/declines
"""
from typing import List, Optional, Literal
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from ..database import get_db
from ..models.procurement import ProcurementRequest
from ..models.produce import Produce
from ..models.farmer import Farmer
from ..models.user import User
from ..routers.auth import get_current_user
from ..routers.notifications import create_notification

router = APIRouter(prefix="/procurement", tags=["procurement"])


# ─── Schemas ─────────────────────────────────────────────

class ProcurementCreate(BaseModel):
    produce_id:   UUID
    produce_name: str
    quantity:     float = 100
    price:        float = 0
    message:      Optional[str] = None


class ProcurementOut(BaseModel):
    id:           str
    produce_id:   Optional[str]
    retailer_id:  str
    farmer_id:    Optional[str]
    produce_name: str
    quantity:     float
    price:        float
    status:       str
    message:      Optional[str]
    created_at:   str
    retailer_name: Optional[str] = None


class StatusUpdate(BaseModel):
    status: Literal["accepted", "declined", "completed"]


# ─── Helpers ─────────────────────────────────────────────

def _fmt(r: ProcurementRequest, retailer_name: str = None) -> dict:
    return {
        "id":           str(r.id),
        "produce_id":   str(r.produce_id) if r.produce_id else None,
        "retailer_id":  str(r.retailer_id),
        "farmer_id":    str(r.farmer_id) if r.farmer_id else None,
        "produce_name": r.produce_name,
        "quantity":     float(r.quantity),
        "price":        float(r.price),
        "status":       r.status,
        "message":      r.message,
        "created_at":   r.created_at.isoformat() if r.created_at else None,
        "retailer_name": retailer_name,
    }


# ─── Routes ──────────────────────────────────────────────

@router.post("", status_code=201)
async def create_request(
    payload: ProcurementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retailer sends a procurement request for a produce listing."""
    if current_user.role not in ("retailer", "admin"):
        raise HTTPException(status_code=403, detail="Only retailers can send procurement requests.")

    # Find the produce
    prod_result = await db.execute(select(Produce).where(Produce.id == payload.produce_id))
    produce     = prod_result.scalar_one_or_none()
    if not produce:
        raise HTTPException(status_code=404, detail="Produce not found.")

    # Find the farmer's user account via farmer_id → user_id
    farmer_user_id = None
    if produce.farmer_id:
        f_result = await db.execute(select(Farmer).where(Farmer.id == produce.farmer_id))
        farmer   = f_result.scalar_one_or_none()
        if farmer and farmer.user_id:
            farmer_user_id = farmer.user_id

    req = ProcurementRequest(
        produce_id   = payload.produce_id,
        retailer_id  = current_user.id,
        farmer_id    = farmer_user_id,
        produce_name = payload.produce_name,
        quantity     = payload.quantity,
        price        = payload.price,
        message      = payload.message,
        status       = "pending",
    )
    db.add(req)
    await db.flush()
    await db.refresh(req)

    # Notify the farmer
    if farmer_user_id:
        await create_notification(
            db, farmer_user_id,
            title="🤝 New Procurement Request!",
            message=f"{current_user.full_name} wants to buy {payload.quantity:.0f} kg of {payload.produce_name} at ₹{payload.price}/unit. Check your Procurement → Retailer Requirements.",
            type="request",
            related_id=str(req.id),
        )

    return _fmt(req, current_user.full_name)


@router.get("/my-requests")
async def my_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Farmer sees incoming requests; Retailer sees outgoing requests."""
    if current_user.role == "farmer":
        stmt = select(ProcurementRequest).where(
            ProcurementRequest.farmer_id == current_user.id
        ).order_by(ProcurementRequest.created_at.desc())
    else:
        stmt = select(ProcurementRequest).where(
            ProcurementRequest.retailer_id == current_user.id
        ).order_by(ProcurementRequest.created_at.desc())

    result = await db.execute(stmt)
    rows   = result.scalars().all()

    # Enrich with retailer name
    out = []
    for r in rows:
        name = None
        if r.retailer_id:
            u = await db.execute(select(User).where(User.id == r.retailer_id))
            u = u.scalar_one_or_none()
            if u: name = u.full_name
        out.append(_fmt(r, name))
    return out


@router.patch("/{req_id}/status")
async def update_status(
    req_id: UUID,
    payload: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Farmer accepts or declines a request."""
    result = await db.execute(select(ProcurementRequest).where(ProcurementRequest.id == req_id))
    req    = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    if str(req.farmer_id) != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorised.")

    req.status     = payload.status
    req.updated_at = datetime.utcnow()
    await db.flush()
    await db.refresh(req)

    # Notify the retailer of the decision
    if req.retailer_id:
        emoji = "✅" if payload.status == "accepted" else "❌"
        await create_notification(
            db, req.retailer_id,
            title=f"{emoji} Request {payload.status.capitalize()}",
            message=f"Your procurement request for {req.produce_name} has been {payload.status} by the farmer.",
            type="request",
            related_id=str(req.id),
        )

    return _fmt(req)
