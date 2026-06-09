from fastapi import APIRouter

from app.services.business_summary import build_placeholder_summary

router = APIRouter()


@router.get("/business-summary")
def business_summary() -> dict[str, object]:
    return build_placeholder_summary()
