from __future__ import annotations

import json

import pandas as pd

from .paths import MARTS_DIR, ensure_outputs_dir


def profile_table(name: str) -> dict:
    frame = pd.read_csv(MARTS_DIR / f"{name}.csv")
    return {
        "table": name,
        "rows": int(len(frame)),
        "columns": int(len(frame.columns)),
        "missing_cells": int(frame.isna().sum().sum()),
        "duplicate_rows": int(frame.duplicated().sum()),
    }


def main() -> None:
    outputs = ensure_outputs_dir()
    tables = [
        "dim_customers",
        "dim_categories",
        "fact_orders",
        "mart_monthly_revenue",
        "mart_channel_performance",
        "mart_regional_margin",
        "mart_category_performance",
        "mart_cohort_retention",
        "mart_revenue_forecast",
    ]
    profiles = [profile_table(table) for table in tables]
    pd.DataFrame(profiles).to_csv(outputs / "mart_profiles.csv", index=False)
    (outputs / "mart_profiles.json").write_text(json.dumps(profiles, indent=2), encoding="utf-8")
    print(f"Wrote {outputs / 'mart_profiles.csv'}")


if __name__ == "__main__":
    main()
