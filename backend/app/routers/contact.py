from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.contact import ContactMessage
from ..schemas.contact import ContactMessageCreate, ContactMessageOut

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactMessageOut, status_code=status.HTTP_201_CREATED)
async def submit_contact(payload: ContactMessageCreate, db: AsyncSession = Depends(get_db)):
    msg = ContactMessage(**payload.model_dump())
    db.add(msg)
    await db.flush()
    await db.refresh(msg)
    return msg
