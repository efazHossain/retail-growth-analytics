def build_placeholder_summary() -> dict[str, object]:
    """Return a Phase 1 placeholder until marts are loaded through the API/database path."""
    return {
        "status": "placeholder",
        "summary": "Business summaries will reuse the existing retail marts in Phase 2.",
        "planned_inputs": [
            "mart_monthly_revenue",
            "mart_category_performance",
            "mart_forecast_accuracy",
            "mart_anomaly_alerts",
        ],
    }
