# Python Workflow

The Python layer is optional and is meant for deeper analytical work after the warehouse-style CSV marts are built.

## What Python Adds

- DataFrame-based profiling of mart tables
- Customer value segmentation
- A simple rolling backtest for the revenue forecast concept
- Notebook-friendly reusable modules

## Recommended Flow

```powershell
node scripts/build.js
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e .
python python/run_all.py
```

## Outputs

The Python scripts write outputs to `python/outputs/`:

- `mart_profiles.csv`
- `mart_profiles.json`
- `customer_value_tiers.csv`
- `customer_segment_summary.csv`
- `forecast_backtest.csv`
- `forecast_backtest_summary.csv`

## Why This Is Useful

The project separates production-style transformation logic from exploratory analysis. The modeled marts are created first, then Python reads those stable tables for profiling, segmentation, and forecast evaluation.
