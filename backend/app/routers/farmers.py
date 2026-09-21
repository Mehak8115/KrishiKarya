from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models.farmer import Farmer
from ..schemas.farmer import FarmerCreate, FarmerOut

router = APIRouter(prefix="/farmers", tags=["farmers"])


@router.get("", response_model=List[FarmerOut])
async def list_farmers(
    limit: int = 50,
    skip: int = 0,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Farmer).order_by(Farmer.joined_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/{farmer_id}", response_model=FarmerOut)
async def get_farmer(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Farmer).where(Farmer.id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer


@router.post("", response_model=FarmerOut, status_code=status.HTTP_201_CREATED)
async def create_farmer(payload: FarmerCreate, db: AsyncSession = Depends(get_db)):
    # Check phone uniqueness
    existing = await db.execute(select(Farmer).where(Farmer.phone == payload.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="A farmer with this phone number already exists")
    farmer = Farmer(**payload.model_dump())
    db.add(farmer)
    await db.flush()
    await db.refresh(farmer)
    return farmer
