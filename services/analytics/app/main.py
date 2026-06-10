import logging

from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.logging import configure_logging
from app.middleware import RequestLoggingMiddleware
from app.routers.analytics import router as analytics_router
from app.routers.health import router as health_router

configure_logging()
logger = logging.getLogger("analytics.errors")

app = FastAPI(
    title="Retail Intelligence Analytics Service",
    version="0.5.0",
    description="CSV-backed analytics service for forecast, anomaly, KPI, trend, and business summary endpoints.",
)

app.add_middleware(RequestLoggingMiddleware)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    logger.exception("analytics endpoint failed", extra={"request_id": request_id, "path": request.url.path})
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Unexpected analytics service error",
            "request_id": request_id,
        },
    )


app.include_router(health_router)
app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
