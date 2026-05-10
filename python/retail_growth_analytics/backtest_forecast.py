from __future__ import annotations

import pandas as pd

from .paths import MARTS_DIR, ensure_outputs_dir


def linear_forecast(values: pd.Series) -> float:
    x = pd.Series(range(1, len(values) + 1), dtype="float")
    y = values.astype(float).reset_index(drop=True)
    slope = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()
    intercept = y.mean() - slope * x.mean()
    return float(intercept + slope * (len(values) + 1))


def main() -> None:
    outputs = ensure_outputs_dir()
    monthly = pd.read_csv(MARTS_DIR / "mart_monthly_revenue.csv").sort_values("month")

    rows = []
    for index in range(6, len(monthly)):
        training = monthly.iloc[index - 6 : index]
        actual = float(monthly.iloc[index]["revenue"])
        forecast = linear_forecast(training["revenue"])
        rows.append(
            {
                "month": monthly.iloc[index]["month"],
                "actual_revenue": round(actual, 2),
                "forecast_revenue": round(forecast, 2),
                "absolute_error": round(abs(actual - forecast), 2),
                "absolute_percentage_error": round(abs(actual - forecast) / actual, 4),
            }
        )

    backtest = pd.DataFrame(rows)
    backtest.to_csv(outputs / "forecast_backtest.csv", index=False)

    summary = {
        "backtest_months": len(backtest),
        "mae": round(backtest["absolute_error"].mean(), 2),
        "mape": round(backtest["absolute_percentage_error"].mean(), 4),
    }
    pd.DataFrame([summary]).to_csv(outputs / "forecast_backtest_summary.csv", index=False)
    print(f"Wrote {outputs / 'forecast_backtest.csv'}")


if __name__ == "__main__":
    main()
