# Lineage

The project follows a small warehouse-style lineage pattern.

```mermaid
flowchart LR
  raw_customers["raw/customers.csv"] --> stg_customers["stg_customers"]
  raw_orders["raw/orders.csv"] --> stg_orders["stg_orders"]
  stg_orders --> stg_categories["stg_categories"]

  stg_customers --> dim_customers["dim_customers"]
  stg_categories --> dim_categories["dim_categories"]
  stg_orders --> fact_orders["fact_orders"]
  stg_customers --> fact_orders
  stg_categories --> fact_orders

  stg_orders --> monthly["mart_monthly_revenue"]
  stg_orders --> channel["mart_channel_performance"]
  stg_orders --> region["mart_regional_margin"]
  stg_orders --> category["mart_category_performance"]
  stg_customers --> cohort["mart_cohort_retention"]
  stg_orders --> cohort

  monthly --> forecast["mart_revenue_forecast"]
  monthly --> backtest["mart_forecast_backtest"]
  backtest --> accuracy["mart_forecast_accuracy"]
  monthly --> anomalies["mart_anomaly_alerts"]

  monthly --> dashboard["Dashboard"]
  channel --> dashboard
  region --> dashboard
  category --> dashboard
  cohort --> dashboard
  forecast --> dashboard
  accuracy --> dashboard
  anomalies --> dashboard

  monthly --> analysis["SQL-style analysis outputs"]
  channel --> analysis
  region --> analysis
  category --> analysis
  cohort --> analysis
  forecast --> analysis
  backtest --> analysis
  accuracy --> analysis
  anomalies --> analysis
```

## Pipeline Order

1. Generate source CSVs.
2. Build staging models.
3. Build dimensions, facts, and marts.
4. Run validation checks.
5. Materialize SQL-style analysis outputs.
6. Write dashboard summary and executive summary.
7. Optionally run the Python analysis layer.

The build runner is:

```powershell
node scripts/build.js
```
