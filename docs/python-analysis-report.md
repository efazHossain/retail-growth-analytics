# Python Analysis Report

The optional Python layer reads the curated marts and creates additional analytical outputs.

Run:

```powershell
python python/run_all.py
```

## Customer Value Tiers

![Customer value tiers](assets/python-customer-value-tiers.svg)

The customer segmentation script assigns each customer to a value tier based on lifetime revenue and repeat order behavior. The output supports deeper questions about which customers are high value, growth potential, repeat low value, or early stage.

## Forecast Backtest

![Forecast backtest](assets/python-forecast-backtest.svg)

The forecast backtest compares actual revenue with a rolling six-month linear forecast. This turns forecasting from a static estimate into a measurable process.

## Mart Profiling

![Mart profiling](assets/python-mart-profiles.svg)

The mart profiling output checks row counts, column counts, missing cells, and duplicate rows for each curated table. This is a lightweight Python complement to the JavaScript validation layer.

## Outputs

```text
python/outputs/mart_profiles.csv
python/outputs/mart_profiles.json
python/outputs/customer_value_tiers.csv
python/outputs/customer_segment_summary.csv
python/outputs/forecast_backtest.csv
python/outputs/forecast_backtest_summary.csv
```
