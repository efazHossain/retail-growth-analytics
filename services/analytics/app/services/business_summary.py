from app.services.analytics_engine import business_summary


def build_business_summary() -> dict[str, object]:
    return business_summary()
