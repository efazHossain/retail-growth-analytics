from __future__ import annotations

import html
from pathlib import Path

import pandas as pd

from .paths import PROJECT_ROOT, PYTHON_OUTPUTS_DIR, ensure_outputs_dir


ASSET_DIR = PROJECT_ROOT / "docs" / "assets"


def main() -> None:
    ensure_outputs_dir()
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    render_customer_tiers()
    render_forecast_backtest()
    render_mart_profiles()
    print(f"Wrote Python visual assets to {ASSET_DIR}")


def render_customer_tiers() -> None:
    customers = pd.read_csv(PYTHON_OUTPUTS_DIR / "customer_value_tiers.csv")
    counts = (
        customers["value_tier"]
        .value_counts()
        .rename_axis("value_tier")
        .reset_index(name="customers")
        .sort_values("customers", ascending=True)
    )
    svg = horizontal_bar_chart(
        counts["value_tier"].tolist(),
        counts["customers"].tolist(),
        "Customer Value Tiers",
        "Customers",
        "#1d6fd6",
    )
    write_asset("python-customer-value-tiers.svg", svg)


def render_forecast_backtest() -> None:
    backtest = pd.read_csv(PYTHON_OUTPUTS_DIR / "forecast_backtest.csv")
    svg = line_comparison_chart(
        backtest["month"].tolist(),
        backtest["actual_revenue"].tolist(),
        backtest["forecast_revenue"].tolist(),
        "Forecast Backtest",
        "Actual revenue",
        "Forecast revenue",
    )
    write_asset("python-forecast-backtest.svg", svg)


def render_mart_profiles() -> None:
    profiles = pd.read_csv(PYTHON_OUTPUTS_DIR / "mart_profiles.csv").sort_values("rows", ascending=True)
    labels = [name.replace("mart_", "").replace("dim_", "").replace("fact_", "") for name in profiles["table"]]
    svg = horizontal_bar_chart(
        labels,
        profiles["rows"].tolist(),
        "Mart Row Counts",
        "Rows",
        "#b7791f",
    )
    write_asset("python-mart-profiles.svg", svg)


def horizontal_bar_chart(labels: list[str], values: list[float], title: str, value_label: str, color: str) -> str:
    width = 920
    row_height = 46
    top = 86
    left = 210
    right = 70
    height = top + row_height * len(labels) + 42
    max_value = max(values) if values else 1
    plot_width = width - left - right

    rows = []
    for index, (label, value) in enumerate(zip(labels, values)):
        y = top + index * row_height
        bar_width = max(2, (value / max_value) * plot_width)
        rows.append(
            f"""
            <text x="{left - 14}" y="{y + 18}" text-anchor="end" class="label">{escape(label)}</text>
            <rect x="{left}" y="{y}" width="{plot_width}" height="16" rx="8" class="track" />
            <rect x="{left}" y="{y}" width="{bar_width:.1f}" height="16" rx="8" fill="{color}" />
            <text x="{left + bar_width + 10}" y="{y + 14}" class="value">{format_number(value)}</text>
            """
        )

    return svg_frame(
        width,
        height,
        title,
        f"{value_label} by category",
        "\n".join(rows),
    )


def line_comparison_chart(labels: list[str], actual: list[float], forecast: list[float], title: str, actual_label: str, forecast_label: str) -> str:
    width = 920
    height = 430
    left = 76
    right = 42
    top = 92
    bottom = 72
    plot_width = width - left - right
    plot_height = height - top - bottom
    values = actual + forecast
    min_value = min(values) * 0.92
    max_value = max(values) * 1.08

    def point(value: float, index: int) -> tuple[float, float]:
        x = left + (index / (len(labels) - 1)) * plot_width
        y = top + (1 - ((value - min_value) / (max_value - min_value))) * plot_height
        return x, y

    actual_points = [point(value, index) for index, value in enumerate(actual)]
    forecast_points = [point(value, index) for index, value in enumerate(forecast)]
    actual_path = path_from_points(actual_points)
    forecast_path = path_from_points(forecast_points)

    grid = []
    for i in range(5):
        y = top + (i / 4) * plot_height
        value = max_value - (i / 4) * (max_value - min_value)
        grid.append(f'<line x1="{left}" y1="{y:.1f}" x2="{width - right}" y2="{y:.1f}" class="grid" />')
        grid.append(f'<text x="{left - 12}" y="{y + 4:.1f}" text-anchor="end" class="axis">${int(value / 1000)}k</text>')

    x_labels = []
    for index, label in enumerate(labels):
        if index % 2 == 0 or index == len(labels) - 1:
            x, _ = point(actual[index], index)
            x_labels.append(f'<text x="{x:.1f}" y="{height - 34}" text-anchor="middle" class="axis">{escape(label)}</text>')

    body = f"""
      {''.join(grid)}
      <path d="{actual_path}" fill="none" stroke="#1d6fd6" stroke-width="4" />
      <path d="{forecast_path}" fill="none" stroke="#b7791f" stroke-width="4" stroke-dasharray="8 8" />
      {''.join(x_labels)}
      <circle cx="{actual_points[-1][0]:.1f}" cy="{actual_points[-1][1]:.1f}" r="5" fill="#1d6fd6" />
      <circle cx="{forecast_points[-1][0]:.1f}" cy="{forecast_points[-1][1]:.1f}" r="5" fill="#b7791f" />
      <rect x="{left}" y="56" width="14" height="14" fill="#1d6fd6" rx="3" />
      <text x="{left + 22}" y="68" class="legend">{escape(actual_label)}</text>
      <rect x="{left + 170}" y="56" width="14" height="14" fill="#b7791f" rx="3" />
      <text x="{left + 192}" y="68" class="legend">{escape(forecast_label)}</text>
    """
    return svg_frame(width, height, title, "Rolling six-month trend forecast compared with actual revenue", body)


def path_from_points(points: list[tuple[float, float]]) -> str:
    commands = [f"M {points[0][0]:.1f} {points[0][1]:.1f}"]
    commands.extend(f"L {x:.1f} {y:.1f}" for x, y in points[1:])
    return " ".join(commands)


def svg_frame(width: int, height: int, title: str, subtitle: str, body: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <style>
    .bg {{ fill: #f4f7f9; }}
    .panel {{ fill: #ffffff; stroke: #d9e2ec; stroke-width: 1; }}
    .title {{ font: 700 26px Arial, sans-serif; fill: #16202a; }}
    .subtitle {{ font: 14px Arial, sans-serif; fill: #667085; }}
    .label {{ font: 14px Arial, sans-serif; fill: #16202a; }}
    .value {{ font: 700 13px Arial, sans-serif; fill: #16202a; }}
    .axis {{ font: 12px Arial, sans-serif; fill: #667085; }}
    .legend {{ font: 13px Arial, sans-serif; fill: #16202a; }}
    .track {{ fill: #e9eef4; }}
    .grid {{ stroke: #d9e2ec; stroke-width: 1; }}
  </style>
  <rect width="{width}" height="{height}" class="bg" />
  <rect x="14" y="14" width="{width - 28}" height="{height - 28}" rx="8" class="panel" />
  <text x="34" y="48" class="title">{escape(title)}</text>
  <text x="34" y="72" class="subtitle">{escape(subtitle)}</text>
  {body}
</svg>
"""


def format_number(value: float) -> str:
    return f"{int(round(value)):,}"


def escape(value: object) -> str:
    return html.escape(str(value).replace("_", " ").title())


def write_asset(filename: str, svg: str) -> None:
    (ASSET_DIR / filename).write_text(svg, encoding="utf-8")


if __name__ == "__main__":
    main()
