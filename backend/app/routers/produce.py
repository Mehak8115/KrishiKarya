from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models.produce import Produce
from ..models.farmer import Farmer
from ..models.user import User
from ..schemas.produce import ProduceCreate, ProduceUpdate, ProduceOut
from ..routers.auth import get_current_user, oauth2_scheme
from ..routers.notifications import create_notification

router = APIRouter(prefix="/produce", tags=["produce"])


async def _resolve_user(token: Optional[str], db: AsyncSession) -> Optional[User]:
    """Silently resolve user from bearer token."""
    if not token:
        return None
    try:
        from ..config import get_settings
        from jose import jwt as _jwt
        s = get_settings()
        payload = _jwt.decode(token, s.SECRET_KEY, algorithms=[s.ALGORITHM])
        uid = payload.get("sub")
        if not uid:
            return None
        result = await db.execute(select(User).where(User.id == UUID(uid)))
        return result.scalar_one_or_none()
    except Exception:
        return None


@router.get("/my", response_model=List[ProduceOut])
async def my_produce_listings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return produce listings for the logged-in farmer."""
    # Try to find their Farmer record by name match
    farmer_result = await db.execute(
        select(Farmer).where(Farmer.name == current_user.full_name)
    )
    farmer = farmer_result.scalar_one_or_none()

    if farmer:
        stmt = (select(Produce)
                .where(Produce.farmer_id == farmer.id)
                .order_by(Produce.listed_at.desc()))
    else:
        # Show all active if no farmer record linked
        stmt = select(Produce).where(Produce.is_active == True).order_by(Produce.listed_at.desc())

    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("", response_model=List[ProduceOut])
async def list_produce(
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    grade:    Optional[str] = Query(None),
    q:        Optional[str] = Query(None),
    sort:     Optional[str] = Query("newest"),
    limit:    int           = Query(50, ge=1, le=200),
    skip:     int           = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint — returns all active listings (visible to everyone including retailers)."""
    stmt = select(Produce).where(Produce.is_active == True)

    if category and category != "all":
        stmt = stmt.where(Produce.category == category)
    if location and location != "all":
        stmt = stmt.where(Produce.location == location)
    if grade and grade != "all":
        stmt = stmt.where(Produce.grade == grade)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(
            Produce.name_en.ilike(like) |
            Produce.name_hi.ilike(like) |
            Produce.location.ilike(like)
        )

    if sort == "price_low":
        stmt = stmt.order_by(Produce.price.asc())
    elif sort == "price_high":
        stmt = stmt.order_by(Produce.price.desc())
    elif sort == "grade":
        stmt = stmt.order_by(Produce.grade.asc())
    else:
        stmt = stmt.order_by(Produce.listed_at.desc())

    result = await db.execute(stmt.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{produce_id}", response_model=ProduceOut)
async def get_produce(produce_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Produce).where(Produce.id == produce_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Produce listing not found")
    return item


@router.post("", response_model=ProduceOut, status_code=status.HTTP_201_CREATED)
async def create_produce(
    payload: ProduceCreate,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a produce listing.
    If called by an authenticated farmer, automatically links their farmer_id
    and makes the listing visible to all retailers on the marketplace.
    """
    data = payload.model_dump()

    # Auto-link farmer_id from JWT if not provided
    if not data.get("farmer_id") and token:
        user = await _resolve_user(token, db)
        if user and user.role == "farmer":
            farmer_result = await db.execute(
                select(Farmer).where(Farmer.name == user.full_name)
            )
            farmer = farmer_result.scalar_one_or_none()
            if not farmer:
                # Auto-create a Farmer record linked to this user
                farmer = Farmer(
                    name=user.full_name,
                    phone=f"+91{str(abs(hash(user.email)))[:10]}",
                    location=data.get("location", "India"),
                    state=data.get("location", "India").split(",")[-1].strip(),
                    verified=True,
                    user_id=user.id,
                )
                db.add(farmer)
                await db.flush()
            elif not farmer.user_id:
                # Backfill user_id if missing
                farmer.user_id = user.id
                await db.flush()
            data["farmer_id"] = farmer.id

    item = Produce(**data)
    db.add(item)
    await db.flush()
    await db.refresh(item)

    # Notify all admins that a new listing was created
    try:
        admin_result = await db.execute(
            select(User).where(User.role == "admin", User.is_active == True)
        )
        admins = admin_result.scalars().all()
        farmer_name = "A farmer"
        if data.get("farmer_id"):
            fr = await db.execute(select(Farmer).where(Farmer.id == data["farmer_id"]))
            fr_obj = fr.scalar_one_or_none()
            if fr_obj:
                farmer_name = fr_obj.name
        for admin in admins:
            await create_notification(
                db, admin.id,
                title="New Produce Listed",
                message=f"{farmer_name} listed {item.name_en} ({item.grade} grade, ₹{item.price}) from {item.location}.",
                type="produce",
                related_id=str(item.id),
            )
    except Exception:
        pass

    return item


@router.put("/{produce_id}", response_model=ProduceOut)
async def update_produce(
    produce_id: UUID,
    payload: ProduceUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Produce).where(Produce.id == produce_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Produce listing not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.flush()
    await db.refresh(item)
    return item


@router.delete("/{produce_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_produce(produce_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Produce).where(Produce.id == produce_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Produce listing not found")
    item.is_active = False
    await db.flush()
