# Project Summary

Retail Growth Analytics is a personal data analytics and analytics engineering project that simulates how raw retail transaction data becomes trusted reporting and analysis.

## Problem

The project asks how a retail business can grow revenue while protecting margin. It studies revenue trends, category performance, channel discounting, regional margin, cohort retention, forecasting, and metric anomalies.

## Data Workflow

The workflow follows a layered approach:

```text
raw data -> staging -> dimensions/facts -> marts -> quality checks -> analysis outputs -> dashboard
```

This keeps source cleanup, business logic, quality checks, and reporting outputs separated.

## Analytics Engineering Work

The project includes:

- source data generation
- staging models
- fact and dimension tables
- business marts
- data quality checks
- SQL-style analysis outputs
- model catalog and lineage documentation
- BI handoff notes
- run history tracking
- a dbt-style scaffold for future conversion

## Analytics Work

The analysis covers:

- monthly revenue growth
- category profitability
- channel discount behavior
- regional margin comparison
- customer cohort retention
- revenue forecasting
- forecast accuracy backtesting
- anomaly monitoring

## Python Work

The optional Python layer supports:

- mart profiling
- customer value segmentation
- forecast backtesting
- notebook-ready exploration

## Dashboard

The dashboard summarizes KPIs, revenue trend, category performance, channel mix, regional margin, cohort retention, validation health, forecast, forecast accuracy, and anomaly alerts.

## What This Shows

This project is intentionally built as more than a charting exercise. It shows the full path from raw data to modeled data, tested outputs, analytical findings, monitoring, and documentation.

## Future Improvements

- Convert the dbt-style scaffold into executable dbt models.
- Add anomaly trend visuals to the dashboard.
- Add notebook charts from the Python analysis layer.
- Connect the mart CSVs to Power BI or Tableau.
- Add runtime duration and row-count deltas to the run history.
