# dbt-Style Scaffold

This folder documents how the project could map into dbt if it later moves from dependency-light local scripts into a formal analytics engineering workflow.

The current project intentionally runs without dbt so the pipeline is easy to execute with plain Node and optional Python.

## Suggested dbt Model Mapping

```text
models/
  staging/
    stg_customers.sql
    stg_orders.sql
    stg_categories.sql
  marts/
    dim_customers.sql
    dim_categories.sql
    fact_orders.sql
    mart_monthly_revenue.sql
    mart_channel_performance.sql
    mart_regional_margin.sql
    mart_category_performance.sql
    mart_cohort_retention.sql
    mart_revenue_forecast.sql
    mart_forecast_backtest.sql
    mart_forecast_accuracy.sql
    mart_anomaly_alerts.sql
```

## Suggested Tests

- unique `order_id` in `fact_orders`
- unique `customer_id` in `dim_customers`
- not null IDs and dates
- accepted values for validation status and anomaly alert flag
- relationship test from `fact_orders.customer_id` to `dim_customers.customer_id`
- relationship test from `fact_orders.category_id` to `dim_categories.category_id`

## Why This Is Separate

The scripts in this repository already demonstrate the concepts dbt formalizes: staging, marts, tests, documentation, and lineage. This scaffold is a roadmap for a future dbt conversion rather than an additional dependency in the current project.
