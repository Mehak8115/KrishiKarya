from typing import List
from uuid import UUID
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models.order import Order, OrderItem
from ..models.produce import Produce
from ..models.farmer import Farmer
from ..models.user import User
from ..schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from ..routers.auth import get_current_user
from ..routers.notifications import create_notification

router = APIRouter(prefix="/orders", tags=["orders"])


async def _find_farmer_user(farmer: Farmer, db: AsyncSession) -> User | None:
    """Find User for a farmer using user_id (fastest) then name fallback."""
    # Best: direct user_id link
    if farmer.user_id:
        result = await db.execute(select(User).where(User.id == farmer.user_id))
        user = result.scalar_one_or_none()
        if user:
            return user
    # Fallback: name match
    result = await db.execute(
        select(User).where(User.full_name == farmer.name, User.role == "farmer")
    )
    user = result.scalar_one_or_none()
    if user:
        return user
    # Last resort: any active farmer user
    result2 = await db.execute(
        select(User).where(User.role == "farmer", User.is_active == True).order_by(User.created_at.asc())
    )
    return result2.scalar_one_or_none()


@router.get("", response_model=List[OrderOut])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Order)
        .where(Order.buyer_id == current_user.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = Decimal("0")
    order = Order(
        buyer_id=current_user.id,
        delivery_address=payload.delivery_address,
    )
    db.add(order)
    await db.flush()

    # Track which farmers to notify (avoid duplicate notifications)
    farmers_to_notify: dict[UUID, tuple[Farmer, list[str]]] = {}

    for item_data in payload.items:
        res = await db.execute(
            select(Produce).where(Produce.id == item_data.produce_id, Produce.is_active == True)
        )
        produce = res.scalar_one_or_none()
        if not produce:
            raise HTTPException(status_code=404, detail=f"Produce {item_data.produce_id} not found or inactive")

        line_total = item_data.unit_price * item_data.quantity
        total += line_total
        db.add(OrderItem(
            order_id=order.id,
            produce_id=item_data.produce_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
        ))

        # Collect farmer info for notifications
        if produce.farmer_id:
            farmer_res = await db.execute(select(Farmer).where(Farmer.id == produce.farmer_id))
            farmer = farmer_res.scalar_one_or_none()
            if farmer:
                if farmer.id not in farmers_to_notify:
                    farmers_to_notify[farmer.id] = (farmer, [])
                farmers_to_notify[farmer.id][1].append(
                    f"{produce.name_en} x {float(item_data.quantity):.0f} kg"
                )

    order.total_amount = total
    await db.flush()
    await db.refresh(order)

    # Notify each farmer whose produce was ordered
    for farmer_id, (farmer, items_list) in farmers_to_notify.items():
        farmer_user = await _find_farmer_user(farmer, db)
        if farmer_user:
            items_str = ", ".join(items_list)
            await create_notification(
                db, farmer_user.id,
                title="🛒 New Order Received!",
                message=f"{current_user.full_name} placed an order for {items_str}. Total: ₹{float(total):.0f}. Order #{str(order.id)[-8:]}.",
                type="order",
                related_id=str(order.id),
            )

    # Notify all admins
    admin_res = await db.execute(
        select(User).where(User.role == "admin", User.is_active == True)
    )
    for admin in admin_res.scalars().all():
        await create_notification(
            db, admin.id,
            title="New Order",
            message=f"Order #{str(order.id)[-8:]} placed by {current_user.full_name} — ₹{float(total):.0f}.",
            type="order",
            related_id=str(order.id),
        )

    result = await db.execute(
        select(Order).where(Order.id == order.id).options(selectinload(Order.items))
    )
    return result.scalar_one()


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.buyer_id == current_user.id)
        .options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: UUID,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role != "admin" and order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised")

    old_status = order.status
    order.status = payload.status
    await db.flush()
    await db.refresh(order)

    # Notify buyer of status change
    if order.buyer_id and old_status != payload.status:
        await create_notification(
            db, order.buyer_id,
            title=f"Order {payload.status.capitalize()}",
            message=f"Your order #{str(order.id)[-8:]} status has been updated to '{payload.status}'.",
            type="order",
            related_id=str(order.id),
        )

    return order
