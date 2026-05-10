# Retail Growth Analytics

This is an ongoing personal data analytics and analytics engineering project focused on retail growth, profitability, and operational performance. It turns transaction-style source data into staging models, dimensional marts, KPI summaries, SQL analysis, a local dashboard, and written notes that can evolve over time.

## Project Goals

- Explore how revenue growth, margin, discounting, and fulfillment performance interact.
- Keep the workflow reproducible with generated source data and repeatable analysis scripts.
- Practice turning raw order data into clear metrics, questions, charts, and recommendations.
- Build the project in layers so new analyses, data quality checks, and modeled marts can be added over time.

## Project Structure

```text
data/
  raw/              Generated source CSVs
  staging/          Cleaned source-aligned models
  marts/            Facts, dimensions, and analysis-ready marts
  quality/          Validation check outputs
  processed/        Dashboard summary outputs and executive summary
dashboard/          Local dashboard
scripts/            Data generation and analysis pipeline
sql/                SQL business questions and analysis queries
docs/               Data model, metric definitions, quality notes, and project log
```

## Quick Start

```powershell
node scripts/generate-data.js
node scripts/build-staging.js
node scripts/build-marts.js
node scripts/validate-data.js
node scripts/analyze.js
node dashboard/server.js
```

Then open `http://localhost:4173`.

You can also run the full pipeline with:

```powershell
node scripts/build.js
```

## What This Project Covers

1. A reproducible analytics workflow using raw order and customer data.
2. Staging models, dimensions, fact tables, and reusable analytical marts.
3. KPIs for revenue, profit, average order value, margin rate, and fulfillment speed.
4. Segmentation by month, product category, sales channel, and region.
5. Data quality checks that make assumptions visible before data reaches the dashboard.
6. Cohort retention and a lightweight revenue forecast as deeper analysis layers.
7. Written findings and recommendations that can be refined as the project grows.

## Documentation

- [Data model](docs/data-model.md)
- [Metrics definition](docs/metrics-definition.md)
- [Data quality](docs/data-quality.md)
- [Analytics questions](docs/analytics-questions.md)
- [Python workflow](docs/python-workflow.md)
- [Project log](docs/project-log.md)

## Next Improvements

- Add a Power BI or Tableau version of the dashboard.
- Load the CSVs into SQLite or DuckDB and save query outputs.
- Add screenshots and a project journal describing each major analysis update.
- Add forecast accuracy tracking once future actuals are available.
- Extend the Python layer with notebook visuals and more advanced customer segmentation.
