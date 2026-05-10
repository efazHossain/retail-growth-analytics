# BI Handoff

This project can be connected to Power BI, Tableau, DuckDB, SQLite, or a cloud warehouse using the mart CSVs.

## Recommended Tables

Use these files as the BI-ready layer:

- `data/marts/fact_orders.csv`
- `data/marts/dim_customers.csv`
- `data/marts/dim_categories.csv`
- `data/marts/mart_monthly_revenue.csv`
- `data/marts/mart_channel_performance.csv`
- `data/marts/mart_regional_margin.csv`
- `data/marts/mart_category_performance.csv`
- `data/marts/mart_cohort_retention.csv`
- `data/marts/mart_revenue_forecast.csv`
- `data/marts/mart_forecast_backtest.csv`
- `data/marts/mart_forecast_accuracy.csv`

## Suggested Model Relationships

- `fact_orders.customer_id` -> `dim_customers.customer_id`
- `fact_orders.category_id` -> `dim_categories.category_id`

The business marts can be used directly for dashboard pages when the goal is a fast reporting layer.

## Suggested Dashboard Pages

1. Executive Overview: revenue, profit, margin, AOV, monthly trend
2. Profitability: category, channel, and regional margin comparison
3. Customer Behavior: cohort retention and customer value tiers
4. Forecast Tracking: forecast plan, backtest results, MAPE, MAE, and bias

## DuckDB Example

If DuckDB is installed, a table can be created from a mart CSV like this:

```sql
CREATE TABLE mart_monthly_revenue AS
SELECT *
FROM read_csv_auto('data/marts/mart_monthly_revenue.csv');
```

The SQL files in `sql/analysis/` are written to match these mart table names.
