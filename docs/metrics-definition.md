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

Future improvement: store forecast snapshots and compare them against actual monthly revenue after each month closes.
