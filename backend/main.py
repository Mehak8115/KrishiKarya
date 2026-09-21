from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import create_tables
from app.routers import auth, produce, farmers, orders, ai, contact
from app.routers import admin as admin_router
from app.routers import notifications as notif_router
from app.routers import procurement as proc_router
from app.routers import ai_models

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(
    title="Krishi Karya API",
    description="AI-enabled agricultural procurement platform — REST API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
app.include_router(auth.router,         prefix=PREFIX)
app.include_router(produce.router,      prefix=PREFIX)
app.include_router(farmers.router,      prefix=PREFIX)
app.include_router(orders.router,       prefix=PREFIX)
app.include_router(ai.router,           prefix=PREFIX)
app.include_router(contact.router,      prefix=PREFIX)
app.include_router(admin_router.router, prefix=PREFIX)
app.include_router(notif_router.router, prefix=PREFIX)
app.include_router(proc_router.router,  prefix=PREFIX)
app.include_router(ai_models.router,     prefix=PREFIX)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
