# Project Log

## Current Phase

The project now has a full local analytics workflow:

```text
generate raw data
build staging tables
build marts
validate data quality
produce summary outputs
serve dashboard
```

## Extra Technique Added

Two additions push the project beyond basic descriptive reporting:

- Cohort retention analysis to study customer behavior over time
- A simple six-month linear revenue forecast to introduce planning and model governance concepts

The forecast is intentionally labeled as directional. The next step would be tracking forecast accuracy once future actuals are available.

## Future Work

- Add actual SQL execution with SQLite or DuckDB
- Add a Power BI or Tableau version connected to mart CSVs
- Add dbt-style model docs and lineage diagrams
- Add a forecast accuracy table with MAPE or MAE after new months are generated
- Add a small anomaly detection check for sudden margin or discount changes
