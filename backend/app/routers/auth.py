"""
Krishi Karya — Authentication Router
Full OTP-based registration + JWT login
"""
from datetime import datetime, timedelta
from typing import Optional, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
import bcrypt as _bcrypt
from jose import JWTError, jwt

from ..database import get_db
from ..models.user import User
from ..models.farmer import Farmer
from ..models.otp import EmailOTP
from ..schemas.user import UserCreate, UserOut, Token
from ..config import get_settings
from ..services.email_service import send_otp_email, generate_otp

router   = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

from pydantic import BaseModel, EmailStr

# ─── Extra schemas ────────────────────────────────────────

class SendOTPRequest(BaseModel):
    email: EmailStr
    full_name: str
    role: Literal["farmer", "retailer"] = "retailer"

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str
    password: str
    full_name: str
    role: Literal["farmer", "retailer"] = "retailer"

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str


# ─── Helpers ──────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False

def hash_password(password: str) -> str:
    return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt(12)).decode()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise exc
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise exc
    except JWTError:
        raise exc

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user   = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise exc
    return user

async def _save_otp(db: AsyncSession, email: str, otp: str, purpose: str) -> None:
    """Delete old OTPs for this email/purpose, then insert new one."""
    await db.execute(
        delete(EmailOTP).where(EmailOTP.email == email, EmailOTP.purpose == purpose)
    )
    # Use naive UTC datetime to avoid timezone comparison issues
    expires = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    db.add(EmailOTP(email=email, otp_code=otp, purpose=purpose, expires_at=expires))
    await db.flush()

async def _verify_otp(db: AsyncSession, email: str, code: str, purpose: str) -> EmailOTP:
    """Verify OTP. Raises 400 on any failure."""
    result = await db.execute(
        select(EmailOTP).where(
            EmailOTP.email == email,
            EmailOTP.purpose == purpose,
            EmailOTP.is_used == False,
        ).order_by(EmailOTP.created_at.desc())
    )
    otp_row = result.scalar_one_or_none()

    if not otp_row:
        raise HTTPException(status_code=400, detail="No OTP found. Please request a new one.")
    # Both expires_at and utcnow() are naive UTC — safe to compare directly
    if otp_row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")
    if otp_row.otp_code != code.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP. Please check and try again.")

    otp_row.is_used = True
    await db.flush()
    return otp_row


# ─── Routes ───────────────────────────────────────────────

@router.post("/send-otp", status_code=200)
async def send_registration_otp(
    payload: SendOTPRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Step 1 of registration: send a 6-digit OTP to the user's email.
    Returns immediately; email is sent in the background.
    """
    # Check email not already registered
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This email is already registered. Please log in.")

    otp = generate_otp(6)
    await _save_otp(db, payload.email, otp, "register")

    # Send email in background so request returns fast
    background_tasks.add_task(
        send_otp_email,
        to_email=payload.email,
        otp=otp,
        purpose="register",
        full_name=payload.full_name,
    )

    return {
        "message": f"A 6-digit verification code has been sent to {payload.email}. Please check your inbox (and spam folder).",
        "email": payload.email,
        "expires_in_minutes": settings.OTP_EXPIRE_MINUTES,
    }


@router.post("/verify-otp-register", response_model=Token, status_code=201)
async def verify_otp_and_register(
    payload: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Step 2 of registration: verify OTP + create account + return JWT.
    Account is saved to the database and is immediately active.
    """
    # Verify OTP
    await _verify_otp(db, payload.email, payload.otp_code, "register")

    # Ensure not already registered (race condition guard)
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered.")

    if len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")

    # Create user
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    # Auto-create Farmer record if role is farmer
    if payload.role == "farmer":
        farmer = Farmer(
            name=payload.full_name,
            phone=f"+91{str(abs(hash(payload.email)))[:10]}",
            location="India",
            state="India",
            verified=False,
            user_id=user.id,
        )
        db.add(farmer)
        await db.flush()

    # Return JWT immediately — user is logged in right after registration
    token = create_access_token({
        "sub":  str(user.id),
        "role": user.role,
        "name": user.full_name,
    })
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == form.username))
    user   = result.scalar_one_or_none()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact support.")

    token = create_access_token({
        "sub":  str(user.id),
        "role": user.role,
        "name": user.full_name,
    })
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password", status_code=200)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Send password reset OTP. Always returns 200 to prevent email enumeration."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user   = result.scalar_one_or_none()

    if user:
        otp = generate_otp(6)
        await _save_otp(db, payload.email, otp, "reset")
        background_tasks.add_task(
            send_otp_email,
            to_email=payload.email,
            otp=otp,
            purpose="reset",
            full_name=user.full_name,
        )

    return {"message": "If this email is registered, you will receive a reset code shortly."}


@router.post("/reset-password", status_code=200)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    await _verify_otp(db, payload.email, payload.otp_code, "reset")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")

    result = await db.execute(select(User).where(User.email == payload.email))
    user   = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = hash_password(payload.new_password)
    await db.flush()

    return {"message": "Password reset successfully. You can now log in with your new password."}


# Keep old /register endpoint for backward compat (admin seeding etc.)
@router.post("/register", response_model=UserOut, status_code=201)
async def register_direct(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """Direct registration without OTP — for admin/seed use only."""
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    if payload.role == "farmer":
        await db.flush()
        db.add(Farmer(
            name=payload.full_name,
            phone=f"+91{str(abs(hash(payload.email)))[:10]}",
            location="India",
            state="India",
            verified=False,
            user_id=user.id,
        ))
    await db.flush()
    await db.refresh(user)
    return user


@router.get("/dev-otp")
async def dev_get_otp(email: str):
    """DEV ONLY — returns the last OTP sent to an email (never use in production)."""
    from ..services.email_service import get_dev_otp
    otp = get_dev_otp(email)
    if not otp:
        raise HTTPException(status_code=404, detail="No OTP found for this email.")
    return {"email": email, "otp": otp, "note": "Development endpoint only"}
