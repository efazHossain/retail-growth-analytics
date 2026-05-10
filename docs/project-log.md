# Project Log

## Current Phase

The project now has a full local analytics workflow:

```text
generate raw data
build staging tables
build marts
validate data quality
produce summary outputs
run SQL-style analysis outputs
serve dashboard
```

## Extra Technique Added

Two additions push the project beyond basic descriptive reporting:

- Cohort retention analysis to study customer behavior over time
- A simple six-month linear revenue forecast to introduce planning and model governance concepts
- Forecast backtesting with MAE, MAPE, and bias

The forecast is intentionally labeled as directional. The backtest now provides a lightweight way to evaluate whether the forecast is useful enough to keep improving.

## Latest Phase

The project now includes SQL-style analysis outputs, a BI handoff guide, dashboard screenshot capture guidance, and forecast accuracy tracking.

The SQL analysis is materialized into CSV outputs so findings are reproducible without requiring a database engine on every machine. The mart CSVs remain compatible with DuckDB, SQLite, Power BI, Tableau, and cloud warehouses.

## Monitoring Phase

The project now includes rolling anomaly detection for revenue, margin rate, discount rate, and fulfillment days. This adds a monitoring layer on top of validation: validation checks whether data is allowed, while anomaly monitoring checks whether metric movement deserves review.

## Future Work

- Add dbt itself if this project moves from a dependency-light local workflow into a formal warehouse workflow
- Add anomaly trend visuals to the dashboard
