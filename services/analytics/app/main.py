from fastapi import FastAPI

from app.routers.analytics import router as analytics_router
from app.routers.health import router as health_router

app = FastAPI(
    title="Retail Intelligence Analytics Service",
    version="0.1.0",
    description="Phase 1 scaffold for forecast, anomaly, and business summary analytics.",
)

app.include_router(health_router)
app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
