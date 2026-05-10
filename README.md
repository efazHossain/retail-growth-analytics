# Retail Growth Analytics

This is an ongoing personal data analytics project focused on retail growth, profitability, and operational performance. It turns transaction-style data into KPI summaries, SQL questions, a local dashboard, and written notes that can evolve over time.

## Project Goals

- Explore how revenue growth, margin, discounting, and fulfillment performance interact.
- Keep the workflow reproducible with generated source data and repeatable analysis scripts.
- Practice turning raw order data into clear metrics, questions, charts, and recommendations.
- Build the project in layers so new analyses can be added over time.

## Project Structure

```text
data/
  raw/              Generated source CSVs
  processed/        KPI outputs and executive summary
dashboard/          Local dashboard
scripts/            Data generation and analysis pipeline
sql/                SQL business questions
docs/               Optional project notes and screenshots
```

## Quick Start

```powershell
node scripts/generate-data.js
node scripts/analyze.js
node dashboard/server.js
```

Then open `http://localhost:4173`.

## What This Project Covers

1. A reproducible analytics workflow using raw order and customer data.
2. KPIs for revenue, profit, average order value, margin rate, and fulfillment speed.
3. Segmentation by month, product category, sales channel, and region.
4. Written findings and recommendations that can be refined as the project grows.

## Next Improvements

- Add a Power BI or Tableau version of the dashboard.
- Load the CSVs into SQLite or DuckDB and save query outputs.
- Add cohort retention analysis using customer signup dates and repeat purchases.
- Add screenshots and a project journal describing each major analysis update.
