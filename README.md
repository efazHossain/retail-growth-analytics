# Retail Growth Analytics

This is a recruiter-facing data analytics portfolio project that tells a business story from raw transaction data through executive recommendations. It is designed to show practical analytics skills: data generation and cleaning, KPI design, SQL thinking, dashboarding, and concise business communication.

## Why This Project Works for Recruiters

- Clear business problem: identify revenue growth opportunities while protecting margin.
- Reproducible pipeline: raw data is generated, processed, and summarized with simple commands.
- Analytics-ready assets: CSV files, SQL business questions, JSON summary output, and an executive narrative.
- Portfolio-friendly dashboard: local browser dashboard with trend, segment, channel, and region views.

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

## Portfolio Talking Points

1. Built a reproducible analytics workflow using raw order and customer data.
2. Defined KPIs for revenue, profit, average order value, margin rate, and fulfillment speed.
3. Segmented business performance by month, product category, sales channel, and region.
4. Translated findings into executive recommendations rather than stopping at charts.

## Next Improvements

- Add a Power BI or Tableau version of the dashboard.
- Load the CSVs into SQLite or DuckDB and save query outputs.
- Add cohort retention analysis using customer signup dates and repeat purchases.
- Add a short case-study writeup with screenshots for LinkedIn or GitHub.
