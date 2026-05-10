# Anomaly Detection

The project includes a lightweight anomaly monitoring mart:

```text
data/marts/mart_anomaly_alerts.csv
```

The goal is to show how production analytics can monitor metric movement after each pipeline run.

## Metrics Monitored

- Monthly revenue
- Gross margin rate
- Average discount rate
- Average fulfillment days

## Method

For each metric, the pipeline compares the current month against the prior six-month rolling baseline.

The mart stores:

- current value
- rolling baseline average
- rolling baseline standard deviation
- z-score
- threshold
- alert flag
- severity
- explanation note

## Alert Logic

Revenue and margin are monitored with a two-sided threshold because unusually high or low movement can both be worth reviewing.

Discount rate and fulfillment days are monitored with a high-only threshold because increases are the main operating risk.

## Why This Matters

Static dashboards show what happened. Monitoring checks help identify when a metric moves enough that someone should investigate. This brings the project closer to how analytics systems are maintained after launch.
