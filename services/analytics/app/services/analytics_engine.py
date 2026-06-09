from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any

from app.core.config import MARTS_DIR
from app.services.marts import read_mart, safe_float, safe_int, sort_by_month


def ok(data: dict[str, Any]) -> dict[str, Any]:
    return {"status": "ok", "data_source": "csv_marts", "marts_dir": str(MARTS_DIR), "data": data}


def as_mapping(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def forecast_accuracy() -> dict[str, Any]:
    accuracy = read_mart("mart_forecast_accuracy")
    backtest = sort_by_month(read_mart("mart_forecast_backtest"), descending=True)

    if not accuracy and not backtest:
        return ok(
            {
                "available": False,
                "message": "Forecast accuracy marts are not available.",
                "overall": None,
                "error_summary": {},
                "recent_performance": [],
                "worst_periods": [],
            }
        )

    overall = accuracy[0] if accuracy else summarize_backtest(backtest)
    error_summary = summarize_backtest(backtest)
    worst_periods = sorted(backtest, key=lambda row: safe_float(row.get("absolute_percentage_error")), reverse=True)[:5]

    return ok(
        {
            "available": True,
            "overall": overall,
            "error_summary": error_summary,
            "recent_performance": backtest[:6],
            "worst_periods": worst_periods,
        }
    )


def summarize_backtest(rows: list[dict[str, Any]]) -> dict[str, Any]:
    if not rows:
        return {
            "backtest_months": 0,
            "mean_absolute_error": 0,
            "mean_absolute_percentage_error": 0,
            "average_forecast_bias": 0,
            "worst_absolute_error": 0,
        }

    return {
        "backtest_months": len(rows),
        "mean_absolute_error": round(sum(safe_float(row.get("absolute_error")) for row in rows) / len(rows), 2),
        "mean_absolute_percentage_error": round(
            sum(safe_float(row.get("absolute_percentage_error")) for row in rows) / len(rows),
            4,
        ),
        "average_forecast_bias": round(sum(safe_float(row.get("forecast_error")) for row in rows) / len(rows), 2),
        "worst_absolute_error": round(max(safe_float(row.get("absolute_error")) for row in rows), 2),
    }


def anomalies() -> dict[str, Any]:
    rows = sort_by_month(read_mart("mart_anomaly_alerts"), descending=True)
    alerts = [row for row in rows if row.get("alert_flag") == "alert"]
    severity_counts = Counter(str(row.get("severity", "unknown")) for row in rows)
    alert_severity_counts = Counter(str(row.get("severity", "unknown")) for row in alerts)
    metric_counts = Counter(str(row.get("metric_name", "unknown")) for row in alerts)

    return ok(
        {
            "available": bool(rows),
            "total_rows": len(rows),
            "alert_count": len(alerts),
            "severity_counts": dict(severity_counts),
            "alert_severity_counts": dict(alert_severity_counts),
            "affected_metrics": dict(metric_counts),
            "recent_alerts": alerts[:10],
            "recent_rows": rows[:10],
            "message": "No anomaly alerts found." if rows and not alerts else None,
        }
    )


def business_summary() -> dict[str, Any]:
    monthly = sort_by_month(read_mart("mart_monthly_revenue"))
    categories = read_mart("mart_category_performance")
    regions = read_mart("mart_regional_margin")
    channels = read_mart("mart_channel_performance")
    forecast = forecast_accuracy()["data"]
    anomaly_data = anomalies()["data"]

    if not monthly:
        return ok(
            {
                "summary": "Monthly revenue mart is not available, so no business summary can be generated.",
                "highlights": [],
                "risks": ["Missing monthly revenue data."],
                "recommended_actions": ["Run the analytics build and reload marts."],
            }
        )

    latest = monthly[-1]
    previous = monthly[-2] if len(monthly) >= 2 else None
    revenue_delta = safe_float(latest.get("revenue")) - safe_float(previous.get("revenue")) if previous else 0
    margin_delta = safe_float(latest.get("margin_rate")) - safe_float(previous.get("margin_rate")) if previous else 0
    top_category = max(categories, key=lambda row: safe_float(row.get("revenue")), default={})
    lowest_margin_region = min(regions, key=lambda row: safe_float(row.get("margin_rate")), default={})
    top_channel = max(channels, key=lambda row: safe_float(row.get("revenue")), default={})
    forecast_overall = as_mapping(forecast.get("overall"))
    forecast_error_summary = as_mapping(forecast.get("error_summary"))

    summary = (
        f"In {latest.get('month')}, revenue was ${safe_float(latest.get('revenue')):,.0f}. "
        f"Revenue {'increased' if revenue_delta >= 0 else 'declined'} by ${abs(revenue_delta):,.0f} versus the prior month, "
        f"while gross margin {'improved' if margin_delta >= 0 else 'declined'} by {abs(margin_delta) * 100:.1f} percentage points."
    )

    highlights = [
        f"Top revenue category: {top_category.get('category', 'n/a')}.",
        f"Top revenue channel: {top_channel.get('channel', 'n/a')}.",
        f"Forecast MAPE: {safe_float(forecast_overall.get('mean_absolute_percentage_error')) * 100:.1f}%.",
    ]
    risks = []
    if lowest_margin_region:
        risks.append(f"Lowest margin region: {lowest_margin_region.get('region')} at {safe_float(lowest_margin_region.get('margin_rate')) * 100:.1f}%.")
    if anomaly_data.get("alert_count", 0):
        risks.append(f"{anomaly_data.get('alert_count')} anomaly alerts require review.")
    if safe_float(forecast_error_summary.get("mean_absolute_percentage_error")) > 0.15:
        risks.append("Forecast error is elevated relative to the planning threshold.")

    return ok(
        {
            "summary": summary,
            "highlights": highlights,
            "risks": risks,
            "recommended_actions": [
                "Review low-margin regions for pricing, discounting, and cost drivers.",
                "Compare recent forecast misses against monthly revenue volatility.",
                "Prioritize category and channel plans around the highest revenue contributors.",
            ],
        }
    )


def kpis() -> dict[str, Any]:
    monthly = read_mart("mart_monthly_revenue")
    categories = read_mart("mart_category_performance")
    regions = read_mart("mart_regional_margin")
    channels = read_mart("mart_channel_performance")
    anomaly_data = anomalies()["data"]
    forecast = forecast_accuracy()["data"]
    forecast_overall = as_mapping(forecast.get("overall"))

    revenue = sum(safe_float(row.get("revenue")) for row in monthly)
    profit = sum(safe_float(row.get("profit")) for row in monthly)
    orders = sum(safe_int(row.get("orders")) for row in monthly)
    sorted_monthly = sort_by_month(monthly)
    latest = sorted_monthly[-1] if sorted_monthly else {}
    previous = sorted_monthly[-2] if len(sorted_monthly) >= 2 else {}
    latest_revenue = safe_float(latest.get("revenue"))
    previous_revenue = safe_float(previous.get("revenue"))
    latest_margin = safe_float(latest.get("margin_rate"))
    previous_margin = safe_float(previous.get("margin_rate"))

    return ok(
        {
            "revenue": round(revenue, 2),
            "profit": round(profit, 2),
            "orders": orders,
            "gross_margin_rate": round(profit / revenue, 4) if revenue else 0,
            "latest_month": latest.get("month"),
            "latest_month_revenue": latest_revenue,
            "month_over_month_revenue_change": round(latest_revenue - previous_revenue, 2) if previous else None,
            "month_over_month_margin_change": round(latest_margin - previous_margin, 4) if previous else None,
            "top_category": max(categories, key=lambda row: safe_float(row.get("revenue")), default={}),
            "lowest_margin_region": min(regions, key=lambda row: safe_float(row.get("margin_rate")), default={}),
            "best_channel": max(channels, key=lambda row: safe_float(row.get("revenue")), default={}),
            "forecast_mape": forecast_overall.get("mean_absolute_percentage_error"),
            "anomaly_alert_count": anomaly_data.get("alert_count", 0),
        }
    )


def trends() -> dict[str, Any]:
    monthly = sort_by_month(read_mart("mart_monthly_revenue"))
    backtest = sort_by_month(read_mart("mart_forecast_backtest"))
    cohorts = read_mart("mart_cohort_retention")

    revenue_trend = []
    for index, row in enumerate(monthly):
        previous = monthly[index - 1] if index else None
        revenue = safe_float(row.get("revenue"))
        previous_revenue = safe_float(previous.get("revenue")) if previous else 0
        growth = (revenue - previous_revenue) / previous_revenue if previous_revenue else None
        revenue_trend.append(
            {
                "month": row.get("month"),
                "revenue": revenue,
                "margin_rate": safe_float(row.get("margin_rate")),
                "month_over_month_growth": growth,
            }
        )

    retention_by_month: dict[int, list[float]] = defaultdict(list)
    for row in cohorts:
        retention_by_month[safe_int(row.get("month_number"))].append(safe_float(row.get("retention_rate")))

    retention_trend = [
        {
            "month_number": month_number,
            "average_retention_rate": round(sum(values) / len(values), 4) if values else 0,
        }
        for month_number, values in sorted(retention_by_month.items())
    ]

    return ok(
        {
            "revenue_trend": revenue_trend,
            "forecast_error_trend": backtest,
            "retention_trend": retention_trend,
        }
    )
