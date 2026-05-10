# Python Analysis Layer

This folder adds a Python workflow on top of the analytics engineering pipeline.

The main project build still works with Node because Python is not available on every machine by default. These scripts are optional and can be run after installing Python.

## Setup

From WSL:

```bash
cd /mnt/c/Users/efazh/Projects/analytics-project
bash scripts/run-python.sh
```

Manual Windows setup:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e .
```

## Run

```powershell
python -m retail_growth_analytics.profile_marts
python -m retail_growth_analytics.segment_customers
python -m retail_growth_analytics.backtest_forecast
python python/run_all.py
```

## Why This Exists

The JavaScript pipeline builds the warehouse-style layers. The Python layer is for exploratory analytics and analytical modeling:

- profiling mart tables
- segmenting customers by value and behavior
- backtesting the simple revenue forecast idea
- creating notebook-ready outputs
