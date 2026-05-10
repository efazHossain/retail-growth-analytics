# Metrics Definition

This file defines the main metrics used across the project so the dashboard, SQL analysis, and executive summary use the same logic.

## Core Metrics

| Metric | Definition |
| --- | --- |
| Revenue | Sum of order revenue after discount |
| Cost | Sum of recorded order cost |
| Profit | Revenue minus cost |
| Gross Margin Rate | Profit divided by revenue |
| Orders | Count of order records |
| Customers | Count of distinct active customers |
| Units | Sum of units sold |
| Average Order Value | Revenue divided by orders |
| Average Discount Rate | Average order-level discount rate |
| Average Fulfillment Days | Average days from order to fulfillment |

## Cohort Metrics

| Metric | Definition |
| --- | --- |
| Cohort Month | Customer signup month |
| Month Number | Number of months since signup month |
| Cohort Size | Customers who signed up in that cohort month |
| Active Customers | Cohort customers who ordered in that month number |
| Retention Rate | Active customers divided by cohort size |

## Forecast Metric

`mart_revenue_forecast` uses a simple six-month linear trend. It is included as a learning and planning exercise, not as a production-grade forecasting model.

## Forecast Accuracy Metrics

| Metric | Definition |
| --- | --- |
| Forecast Error | Actual revenue minus forecast revenue |
| Absolute Error | Absolute value of forecast error |
| Absolute Percentage Error | Absolute error divided by actual revenue |
| Mean Absolute Error | Average absolute error across backtest months |
| Mean Absolute Percentage Error | Average absolute percentage error across backtest months |
| Average Forecast Bias | Average forecast error across backtest months |

The backtest uses rolling six-month windows. For each month with enough history, the model trains on the prior six months and compares the next forecast with the known actual.

## Anomaly Metrics

| Metric | Definition |
| --- | --- |
| Baseline Average | Prior six-month average for the monitored metric |
| Baseline Standard Deviation | Prior six-month standard deviation for the monitored metric |
| Z-Score | Current value minus baseline average, divided by baseline standard deviation |
| Alert Flag | `alert` when the z-score crosses the metric threshold, otherwise `normal` |
| Severity | `medium` or `high` for alerts, otherwise `normal` |
