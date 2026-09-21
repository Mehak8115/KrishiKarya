import random
from typing import Literal, List, Optional
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, Query, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..database import get_db
from ..models.ai_grade import AIQualityGrade, DemandForecast
from ..routers.auth import oauth2_scheme
from ..config import get_settings

router = APIRouter(prefix="/ai", tags=["ai"])

# ─── Schemas ────────────────────────────────────────────────────────────────

class AIAnalysisResult(BaseModel):
    tool: str
    status: str
    badge: str
    badge_label: str
    confidence: int
    detail: dict
    recommendation: str


class DemandPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    forecast: Optional[float] = None


class DemandForecastResult(BaseModel):
    produce: str
    unit: str
    history: List[DemandPoint]
    forecast: List[DemandPoint]
    trend: str
    trend_pct: float
    insight: str


class MatchScore(BaseModel):
    farmer_id: str
    farmer_name: str
    produce: str
    location: str
    grade: str
    price: float
    stock_kg: float
    match_score: int
    match_reason: str


class MatchResult(BaseModel):
    retailer_need: str
    matches: List[MatchScore]


# ─── Static mock data ────────────────────────────────────────────────────────

DISEASE_RESULTS = [
    {"status":"Healthy",     "issue":"None detected",          "severity":"None",     "badge":"good","badge_label":"Healthy",
     "rec":"Crop looks healthy. Continue normal care and monitor weekly."},
    {"status":"Early Blight","issue":"Alternaria solani",      "severity":"Mild",     "badge":"warn","badge_label":"Warning",
     "rec":"Apply copper-based fungicide. Remove affected leaves. Improve air circulation."},
    {"status":"Late Blight", "issue":"Phytophthora infestans", "severity":"Moderate", "badge":"bad", "badge_label":"Alert",
     "rec":"Urgent: apply systemic fungicide. Isolate affected plants. Reduce irrigation."},
]
RIPENESS_RESULTS = [
    {"stage":"Pre-ripe",  "window":"5–7 days",       "sugar":"8–10 Brix",  "badge":"warn","badge_label":"Pre-ripe",
     "rec":"Harvest in 5–7 days for optimal sweetness and shelf life."},
    {"stage":"Ripe",      "window":"Harvest now",     "sugar":"14–16 Brix", "badge":"good","badge_label":"Peak Ripe",
     "rec":"Optimal window. Harvest now for peak flavour and retail grade."},
    {"stage":"Over-ripe", "window":"Immediate action","sugar":"18+ Brix",   "badge":"bad", "badge_label":"Over-ripe",
     "rec":"Process immediately for juice/pulp. Not suitable for fresh retail."},
]

# Per-crop price ranges — Grade A / B / C
CROP_PRICES = {
    "tomato":      {"A":"₹28–35/kg",  "B":"₹18–24/kg",  "C":"₹10–15/kg"},
    "carrot":      {"A":"₹40–50/kg",  "B":"₹28–36/kg",  "C":"₹16–22/kg"},
    "mango":       {"A":"₹280–350/dozen","B":"₹180–240/dozen","C":"₹100–150/dozen"},
    "potato":      {"A":"₹18–24/kg",  "B":"₹12–16/kg",  "C":"₹8–11/kg"},
    "onion":       {"A":"₹22–30/kg",  "B":"₹14–20/kg",  "C":"₹8–12/kg"},
    "wheat":       {"A":"₹32–40/kg",  "B":"₹24–30/kg",  "C":"₹16–22/kg"},
    "chili":       {"A":"₹70–90/kg",  "B":"₹45–65/kg",  "C":"₹28–40/kg"},
    "grapes":      {"A":"₹100–130/kg","B":"₹70–95/kg",  "C":"₹40–60/kg"},
    "banana":      {"A":"₹50–65/dozen","B":"₹35–45/dozen","C":"₹20–30/dozen"},
    "cauliflower": {"A":"₹35–45/kg",  "B":"₹22–30/kg",  "C":"₹12–18/kg"},
    "spinach":     {"A":"₹28–36/kg",  "B":"₹18–24/kg",  "C":"₹10–15/kg"},
    "turmeric":    {"A":"₹130–160/kg","B":"₹90–115/kg", "C":"₹55–80/kg"},
    "pomegranate": {"A":"₹130–160/kg","B":"₹90–120/kg", "C":"₹55–80/kg"},
    "default":     {"A":"₹35–50/kg",  "B":"₹22–32/kg",  "C":"₹12–18/kg"},
}

QUALITY_RESULTS = [
    {"grade":"A","size":"Uniform (85%+)",    "surface":"Excellent — no blemishes",
     "badge":"good","badge_label":"Grade A",
     "rec":"Premium grade. Suitable for organised retail, modern trade, and export chains."},
    {"grade":"B","size":"Moderate (65–84%)", "surface":"Minor blemishes (<10%)",
     "badge":"warn","badge_label":"Grade B",
     "rec":"Mid-market grade. Suitable for local retail. Minor cosmetic sorting recommended."},
    {"grade":"C","size":"Non-uniform (<65%)","surface":"Visible defects (>10%)",
     "badge":"bad", "badge_label":"Grade C",
     "rec":"Processing grade only. Best suited for juice, pulp, or wholesale processing."},
]
QUALITY_SIGNALS = {
    "tomato":{"A":0.45,"B":0.35},"carrot":{"A":0.50,"B":0.30},"mango":{"A":0.55,"B":0.30},
    "potato":{"A":0.40,"B":0.35},"onion":{"A":0.45,"B":0.30},"wheat":{"A":0.50,"B":0.35},
    "chili":{"A":0.40,"B":0.35},"grapes":{"A":0.50,"B":0.30},"banana":{"A":0.45,"B":0.35},
    "cauliflower":{"A":0.48,"B":0.32},"spinach":{"A":0.45,"B":0.35},
    "turmeric":{"A":0.50,"B":0.30},"pomegranate":{"A":0.52,"B":0.28},
    "default":{"A":0.45,"B":0.35},
}
DEMAND_PRODUCE = {
    "tomato":     {"unit":"quintal","base":120,"seasonal_peak":[10,11,12,1],"trend":0.04},
    "onion":      {"unit":"quintal","base":95, "seasonal_peak":[11,12,1,2], "trend":0.02},
    "potato":     {"unit":"quintal","base":140,"seasonal_peak":[1,2,3,10],  "trend":0.01},
    "wheat":      {"unit":"quintal","base":200,"seasonal_peak":[3,4,5],     "trend":0.03},
    "mango":      {"unit":"dozen",  "base":60, "seasonal_peak":[4,5,6],     "trend":0.05},
    "cauliflower":{"unit":"quintal","base":55, "seasonal_peak":[11,12,1],   "trend":0.02},
    "carrot":     {"unit":"quintal","base":45, "seasonal_peak":[11,12,1],   "trend":0.01},
    "chili":      {"unit":"quintal","base":30, "seasonal_peak":[6,7,8],     "trend":0.03},
}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _hash_seed(s: str) -> int:
    h = 0
    for ch in s:
        h = (31 * h + ord(ch)) & 0xFFFFFFFF
    return h

def _idx(filename: str, size: int) -> int:
    return _hash_seed(filename + str(size)) % 3

def _grade_from_image(filename: str, file_bytes: bytes) -> dict:
    seed      = _hash_seed(filename.lower() + str(len(file_bytes)))
    fname_low = filename.lower()
    crop_key  = next((k for k in QUALITY_SIGNALS if k != "default" and k in fname_low), "default")
    thresholds = QUALITY_SIGNALS[crop_key]
    ratio      = (seed % 1000) / 1000.0
    grade_idx  = 0 if ratio >= thresholds["A"] else (1 if ratio >= thresholds["B"] else 2)
    r          = QUALITY_RESULTS[grade_idx].copy()
    grade      = r["grade"]
    price_map  = CROP_PRICES.get(crop_key, CROP_PRICES["default"])
    r["price"] = price_map[grade]
    r["crop"]  = crop_key if crop_key != "default" else "produce"
    return {**r, "confidence": 82 + (seed % 15)}

def _generate_demand_series(produce: str, months_history: int = 12, months_forecast: int = 6) -> DemandForecastResult:
    cfg   = DEMAND_PRODUCE.get(produce.lower(), DEMAND_PRODUCE["tomato"])
    base, peaks, trend, unit = cfg["base"], cfg["seasonal_peak"], cfg["trend"], cfg["unit"]
    today = datetime.utcnow()

    def seasonal(month):
        return 1.3 if month in peaks else (0.8 if (month-1)%12+1 in peaks or (month+1)%12+1 in peaks else 1.0)

    points_h = []
    for i in range(months_history, 0, -1):
        dt    = today - timedelta(days=30*i)
        noise = 1 + ((_hash_seed(produce+str(i))%200)-100)/1000.0
        points_h.append(DemandPoint(
            date=dt.strftime("%Y-%m"),
            actual=round(base * seasonal(dt.month) * noise * (1+trend*(months_history-i)/12), 1)
        ))

    points_f = []
    for i in range(1, months_forecast+1):
        dt = today + timedelta(days=30*i)
        points_f.append(DemandPoint(
            date=dt.strftime("%Y-%m"),
            forecast=round(base * seasonal(dt.month) * (1+trend*i/12) * 1.02, 1)
        ))

    last_a = points_h[-1].actual
    last_f = points_f[-1].forecast
    pct    = round((last_f - last_a) / last_a * 100, 1) if last_a else 0
    dir_   = "up" if pct > 2 else ("down" if pct < -2 else "stable")
    peaks_str = ", ".join(datetime(2000, m, 1).strftime("%B") for m in peaks)
    insight = (
        f"Demand for {produce.capitalize()} is expected to "
        f"{'increase' if dir_=='up' else 'decrease' if dir_=='down' else 'remain stable'} "
        f"by {abs(pct)}% over the next {months_forecast} months. Peak season: {peaks_str}."
    )
    return DemandForecastResult(produce=produce.capitalize(), unit=unit,
                                history=points_h, forecast=points_f,
                                trend=dir_, trend_pct=pct, insight=insight)

def _compute_match_score(produce_name, farmer_name, location, grade, stock_kg,
                         need_produce, need_qty, need_grade, need_location):
    if produce_name.lower() != need_produce.lower():
        return 0, []
    score, reasons = 40, []
    grade_map  = {"A":3,"B":2,"C":1}
    lg, rg     = grade_map.get(grade,1), grade_map.get(need_grade.upper(),2)
    if lg >= rg:
        score += 25
        if grade == "A": reasons.append("Grade A produce")
    else:
        score += max(0, 25-(rg-lg)*10)
    if float(stock_kg) >= need_qty:
        score += 20
        reasons.append(f"Sufficient stock ({float(stock_kg):.0f} kg)")
    else:
        score += int(20*float(stock_kg)/need_qty)
        reasons.append(f"Partial stock ({float(stock_kg):.0f} kg)")
    req_loc = need_location.lower()
    if req_loc in ("all",""):
        score += 10
    elif req_loc in location.lower() or location.lower() in req_loc:
        score += 15
        reasons.append(f"Near your location ({location})")
    return min(score, 100), reasons

def _resolve_user_id(token: Optional[str]) -> Optional[UUID]:
    if not token:
        return None
    try:
        from jose import jwt as _jwt
        s = get_settings()
        payload = _jwt.decode(token, s.SECRET_KEY, algorithms=[s.ALGORITHM])
        sub = payload.get("sub")
        return UUID(sub) if sub else None
    except Exception:
        return None


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/analyze", response_model=AIAnalysisResult)
async def analyze_crop(
    file: UploadFile = File(...),
    tool: Literal["disease","ripeness","quality"] = Form(...),
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ("image/jpeg","image/png"):
        raise HTTPException(status_code=422, detail="Only JPG and PNG images are accepted")
    contents = await file.read()
    if len(contents) > 8*1024*1024:
        raise HTTPException(status_code=413, detail="Image must be smaller than 8 MB")

    idx = _idx(file.filename or "file", len(contents))

    if tool == "quality":
        r = _grade_from_image(file.filename or "crop.jpg", contents)
        result = AIAnalysisResult(tool=tool, status=r["grade"], badge=r["badge"],
            badge_label=r["badge_label"], confidence=r["confidence"],
            detail={"size":r["size"],"surface":r["surface"],"price":r["price"]},
            recommendation=r["rec"])
    elif tool == "disease":
        r = DISEASE_RESULTS[idx]
        result = AIAnalysisResult(tool=tool, status=r["status"], badge=r["badge"],
            badge_label=r["badge_label"], confidence=82+random.randint(0,14),
            detail={"issue":r["issue"],"severity":r["severity"]},
            recommendation=r["rec"])
    else:
        r = RIPENESS_RESULTS[idx]
        result = AIAnalysisResult(tool=tool, status=r["stage"], badge=r["badge"],
            badge_label=r["badge_label"], confidence=82+random.randint(0,14),
            detail={"window":r["window"],"sugar":r["sugar"]},
            recommendation=r["rec"])

    # Persist result to database (best-effort)
    try:
        user_id = _resolve_user_id(token)
        db.add(AIQualityGrade(
            user_id=user_id,
            tool=tool,
            grade_result=result.status if tool == "quality" else None,
            badge=result.badge,
            confidence=result.confidence,
            detail=result.detail,
            recommendation=result.recommendation,
        ))
        await db.flush()
    except Exception:
        pass

    return result


@router.get("/history")
async def ai_history(
    limit: int = Query(20, ge=1, le=100),
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Return AI inspection history. Returns user-specific records if authenticated, else all."""
    user_id = _resolve_user_id(token)
    stmt = select(AIQualityGrade)
    if user_id:
        stmt = stmt.where(AIQualityGrade.user_id == user_id)
    stmt = stmt.order_by(AIQualityGrade.analyzed_at.desc()).limit(limit)
    rows = (await db.execute(stmt)).scalars().all()
    return [
        {"id":str(r.id),"tool":r.tool,"grade_result":r.grade_result,
         "badge":r.badge,"confidence":r.confidence,"detail":r.detail,
         "recommendation":r.recommendation,
         "analyzed_at":r.analyzed_at.isoformat() if r.analyzed_at else None}
        for r in rows
    ]


@router.get("/demand-forecast", response_model=DemandForecastResult)
async def demand_forecast(
    produce: str = Query("tomato"),
    months_history: int = Query(12, ge=3, le=24),
    months_forecast: int = Query(6, ge=1, le=12),
    db: AsyncSession = Depends(get_db),
):
    result = _generate_demand_series(produce, months_history, months_forecast)
    try:
        db.add(DemandForecast(produce=produce.lower(), forecast_data=result.model_dump()))
        await db.flush()
    except Exception:
        pass
    return result


@router.get("/match-farmers", response_model=MatchResult)
async def match_farmers(
    produce: str = Query(...),
    qty_kg: float = Query(100, ge=1),
    grade: str = Query("B"),
    location: str = Query("all"),
    db: AsyncSession = Depends(get_db),
):
    from ..models.produce import Produce
    from ..models.farmer import Farmer

    base_stmt = (
        select(Produce.id, Produce.name_en, Produce.location, Produce.grade,
               Produce.price, Produce.stock_kg,
               Farmer.name.label("farmer_name"), Farmer.id.label("farmer_id"))
        .outerjoin(Farmer, Produce.farmer_id == Farmer.id)
        .where(Produce.is_active == True)
    )

    exact_stmt = base_stmt.where(func.lower(Produce.name_en) == produce.strip().lower())
    rows = (await db.execute(exact_stmt)).fetchall()

    if not rows:
        fuzzy_stmt = base_stmt.where(func.lower(Produce.name_en).contains(produce.strip().lower()))
        rows = (await db.execute(fuzzy_stmt)).fetchall()

    scored = []
    for row in rows:
        score, reasons = _compute_match_score(
            row.name_en, row.farmer_name or "Unknown", row.location or "",
            row.grade or "C", row.stock_kg,
            produce, qty_kg, grade, location,
        )
        if score == 0:
            continue
        reasons.append(f"₹{float(row.price):.0f} per unit")
        scored.append(MatchScore(
            farmer_id=str(row.farmer_id) if row.farmer_id else str(row.id),
            farmer_name=row.farmer_name or "Unknown Farmer",
            produce=row.name_en, location=row.location or "",
            grade=row.grade or "C", price=float(row.price),
            stock_kg=float(row.stock_kg), match_score=score,
            match_reason=", ".join(reasons),
        ))

    scored.sort(key=lambda x: x.match_score, reverse=True)
    return MatchResult(
        retailer_need=f"{qty_kg:.0f} kg of {produce.capitalize()} (min Grade {grade})",
        matches=scored[:5],
    )
