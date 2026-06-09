from fastapi import FastAPI

from app.routers.analytics import router as analytics_router
from app.routers.health import router as health_router

app = FastAPI(
    title="Retail Intelligence Analytics Service",
    version="0.5.0",
    description="CSV-backed analytics service for forecast, anomaly, KPI, trend, and business summary endpoints.",
)

app.include_router(health_router)
app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
