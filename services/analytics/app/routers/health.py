from fastapi import APIRouter
from app.core.config import MARTS_DIR

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "retail-intelligence-analytics"}


@router.get("/status")
def status() -> dict[str, object]:
    return {
        "status": "ok" if MARTS_DIR.exists() else "degraded",
        "service": "retail-intelligence-analytics",
        "dependencies": {
            "marts": {
                "status": "ok" if MARTS_DIR.exists() else "degraded",
                "path": str(MARTS_DIR),
            }
        },
    }
