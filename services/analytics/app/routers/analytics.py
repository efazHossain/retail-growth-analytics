from fastapi import APIRouter

from app.services.analytics_engine import anomalies as build_anomalies
from app.services.analytics_engine import forecast_accuracy as build_forecast_accuracy
from app.services.analytics_engine import kpis as build_kpis
from app.services.analytics_engine import trends as build_trends
from app.services.business_summary import build_business_summary

router = APIRouter()


@router.get("/business-summary")
def business_summary() -> dict[str, object]:
    return build_business_summary()


@router.get("/forecast-accuracy")
def forecast_accuracy() -> dict[str, object]:
    return build_forecast_accuracy()


@router.get("/anomalies")
def anomalies() -> dict[str, object]:
    return build_anomalies()


@router.get("/kpis")
def kpis() -> dict[str, object]:
    return build_kpis()


@router.get("/trends")
def trends() -> dict[str, object]:
    return build_trends()
