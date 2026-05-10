from __future__ import annotations

import pandas as pd

from .paths import MARTS_DIR, ensure_outputs_dir


def assign_value_tier(row: pd.Series) -> str:
    if row["lifetime_revenue"] >= 2500 and row["lifetime_orders"] >= 4:
        return "high_value_repeat"
    if row["lifetime_revenue"] >= 1200:
        return "growth_potential"
    if row["lifetime_orders"] >= 2:
        return "repeat_low_value"
    return "early_stage"


def main() -> None:
    outputs = ensure_outputs_dir()
    customers = pd.read_csv(MARTS_DIR / "dim_customers.csv")
    customers["value_tier"] = customers.apply(assign_value_tier, axis=1)

    segment_summary = (
        customers.groupby(["segment", "region", "value_tier"], as_index=False)
        .agg(
            customers=("customer_id", "count"),
            avg_lifetime_revenue=("lifetime_revenue", "mean"),
            avg_lifetime_profit=("lifetime_profit", "mean"),
            avg_lifetime_orders=("lifetime_orders", "mean"),
        )
        .round(2)
        .sort_values(["avg_lifetime_revenue", "customers"], ascending=[False, False])
    )

    customers.to_csv(outputs / "customer_value_tiers.csv", index=False)
    segment_summary.to_csv(outputs / "customer_segment_summary.csv", index=False)
    print(f"Wrote {outputs / 'customer_segment_summary.csv'}")


if __name__ == "__main__":
    main()
