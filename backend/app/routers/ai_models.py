import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.config import get_settings


router = APIRouter(prefix="/ai", tags=["trained-models"])

QUALITY_PRICE_BANDS = {
    "tomato": {"A": "₹35-42/kg", "B": "₹22-28/kg", "C": "₹12-18/kg"},
    "potato": {"A": "₹28-34/kg", "B": "₹18-24/kg", "C": "₹10-16/kg"},
    "onion": {"A": "₹30-38/kg", "B": "₹20-28/kg", "C": "₹12-18/kg"},
    "carrot": {"A": "₹38-46/kg", "B": "₹28-35/kg", "C": "₹18-24/kg"},
    "mango": {"A": "₹90-130/kg", "B": "₹60-90/kg", "C": "₹35-60/kg"},
}


class DemandForecastRequest(BaseModel):
    crop: str = Field(min_length=1, max_length=80)
    location: str = Field(min_length=1, max_length=120)
    horizon_days: int = Field(default=30, ge=1, le=90)


def _model_url(path: str) -> str:
    return f"{get_settings().AI_MODEL_SERVICE_URL.rstrip('/')}{path}"


async def _raise_upstream_error(response: httpx.Response) -> None:
    if response.is_success:
        return
    try:
        detail = response.json().get("detail", response.text)
    except ValueError:
        detail = response.text or "AI model service returned an error"
    raise HTTPException(status_code=response.status_code, detail=detail)


@router.post("/quality-grading")
async def quality_grading(
    image: UploadFile = File(...),
    crop: str | None = Form(default=None),
    farmer_id: int | None = Form(default=None),
    produce_id: int | None = Form(default=None),
):
    image_bytes = await image.read()
    files = {"image": (image.filename or "produce.jpg", image_bytes, image.content_type or "image/jpeg")}
    data = {key: str(value) for key, value in {
        "crop": crop,
        "farmer_id": farmer_id,
        "produce_id": produce_id,
    }.items() if value is not None}
    settings = get_settings()
    try:
        async with httpx.AsyncClient(timeout=settings.AI_MODEL_SERVICE_TIMEOUT) as client:
            response = await client.post(_model_url("/api/ai/quality-grading"), files=files, data=data)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="AI model service is unavailable") from exc
    await _raise_upstream_error(response)
    result = response.json()
    crop_key = (result.get("crop") or crop or "produce").strip().lower()
    result["estimated_price"] = QUALITY_PRICE_BANDS.get(
        crop_key, {"A": "Market-linked", "B": "Market-linked", "C": "Market-linked"}
    ).get(result["grade"], "Market-linked")
    return result


@router.post("/demand-forecast")
async def demand_forecast(payload: DemandForecastRequest):
    settings = get_settings()
    try:
        async with httpx.AsyncClient(timeout=settings.AI_MODEL_SERVICE_TIMEOUT) as client:
            response = await client.post(_model_url("/api/ai/demand-forecast"), json=payload.model_dump())
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="AI model service is unavailable") from exc
    await _raise_upstream_error(response)
    return response.json()


@router.get("/models-health")
async def models_health():
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(_model_url("/health"))
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="AI model service is unavailable") from exc
    await _raise_upstream_error(response)
    return response.json()