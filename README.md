# Retail Growth Analytics

[![Validate Analytics Pipeline](https://github.com/efazHossain/retail-growth-analytics/actions/workflows/ci.yml/badge.svg)](https://github.com/efazHossain/retail-growth-analytics/actions/workflows/ci.yml)

Retail Growth Analytics is an ongoing personal data analytics and analytics engineering project. It simulates how raw retail transaction data moves through a trusted analytics workflow: generated source files, staging models, facts and dimensions, business marts, data quality checks, SQL-style analysis outputs, Python analysis, dashboard reporting, and written findings.

The project is built to answer a practical business question: how can a retail business grow revenue while protecting margin?

## Dashboard Preview

### Overview

![Dashboard overview](docs/assets/01-dashboard-overview.png)

### Performance Views

![Performance views](docs/assets/02-performance-views.png)

### Advanced Analytics

![Advanced analytics](docs/assets/03-advanced-analytics.png)

## Python Analysis Preview

### Customer Value Tiers

![Customer value tiers](docs/assets/python-customer-value-tiers.svg)

### Forecast Backtest

![Forecast backtest](docs/assets/python-forecast-backtest.svg)

### Mart Profiling

![Mart profiling](docs/assets/python-mart-profiles.svg)

## What This Project Shows

- Analytics engineering: raw, staging, dimensional, mart, quality, and monitoring layers
- Data analytics: revenue trends, profitability, discounting, regional performance, and customer behavior
- Forecasting discipline: directional revenue forecasts plus rolling backtests with MAE, MAPE, and bias
- Monitoring: rolling anomaly alerts for revenue, margin, discounting, and fulfillment days
- Communication: findings, metric definitions, model catalog, lineage, BI handoff notes, screenshots, and project summary

## Project Structure

```text
data/
  raw/              Generated source CSVs
  staging/          Cleaned source-aligned models
  marts/            Facts, dimensions, and analysis-ready marts
  quality/          Validation check outputs
  analysis_outputs/ Reproducible SQL-style analysis extracts
  warehouse/        CSV warehouse manifest for BI/database loading
  run_history/      Pipeline run history and latest run summary
  processed/        Dashboard summary outputs and executive summary
dashboard/          Local dashboard
python/             Optional Python profiling, segmentation, and forecast scripts
scripts/            Data generation and analysis pipeline
sql/                SQL business questions and analysis queries
docs/               Documentation, findings, screenshots, lineage, and handoff notes
dbt/                dbt-style model and test scaffold for future conversion
```

## Quick Start

```powershell
node scripts/build.js
node dashboard/server.js
```

Then open `http://localhost:4173`.

The full build runs:

```text
generate raw data
build staging models
build marts
validate data quality
run SQL-style analysis outputs
write dashboard summary
record run history
```

## Optional Python Layer

If you want to run the optional Python analysis layer:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e .
python python/run_all.py
```

Python outputs are written to `python/outputs/`.

## Core Outputs

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
- `data/marts/mart_anomaly_alerts.csv`
- `data/analysis_outputs/`
- `data/run_history/pipeline_runs.csv`
- `data/processed/summary.json`

## Documentation

- [Project summary](docs/project-summary.md)
- [Data model](docs/data-model.md)
- [Model catalog](docs/model-catalog.md)
- [Data dictionary](docs/data-dictionary.md)
- [Lineage](docs/lineage.md)
- [Metrics definition](docs/metrics-definition.md)
- [Data quality](docs/data-quality.md)
- [Anomaly detection](docs/anomaly-detection.md)
- [Orchestration](docs/orchestration.md)
- [Analytics questions](docs/analytics-questions.md)
- [Findings](docs/findings.md)
- [BI handoff](docs/bi-handoff.md)
- [Dashboard screenshots](docs/dashboard-screenshots.md)
- [Python workflow](docs/python-workflow.md)
- [Python analysis report](docs/python-analysis-report.md)
- [Project log](docs/project-log.md)

## Dashboard

The local dashboard includes:

- KPI cards for revenue, profit, average order value, and gross margin
- monthly revenue trend
- category performance
- channel mix
- regional margin
- cohort retention
- pipeline health
- revenue forecast
- forecast accuracy
- anomaly alerts

## Next Improvements

- Add notebook visuals from the Python layer.
- Connect the mart CSVs to Power BI or Tableau.
- Convert the dbt-style scaffold into a working dbt project.
- Add anomaly trend visuals to the dashboard.
- Add richer orchestration metadata for runtime duration and row-level diffs.
