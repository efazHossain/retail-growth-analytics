# Model Catalog

This catalog describes the main datasets produced by the project.

## Raw Layer

| Model | Grain | Purpose |
| --- | --- | --- |
| `customers.csv` | One row per customer | Simulated source export for customer attributes |
| `orders.csv` | One row per order | Simulated source export for transaction activity |

## Staging Layer

| Model | Grain | Purpose |
| --- | --- | --- |
| `stg_customers` | One row per customer | Standardizes customer IDs, signup date, region, segment, and signup month |
| `stg_orders` | One row per order | Standardizes order dates, numeric fields, profit, order month, discounts, and fulfillment days |
| `stg_categories` | One row per category | Provides category IDs for dimensional modeling |

## Dimensional Layer

| Model | Grain | Purpose |
| --- | --- | --- |
| `dim_customers` | One row per customer | Customer attributes plus lifetime order, revenue, and profit metrics |
| `dim_categories` | One row per category | Category lookup table |
| `fact_orders` | One row per order | Transaction fact table with customer and category keys |

## Mart Layer

| Model | Grain | Purpose |
| --- | --- | --- |
| `mart_monthly_revenue` | One row per month | Monthly revenue, profit, margin, AOV, customer, and fulfillment KPIs |
| `mart_channel_performance` | One row per channel | Channel revenue, profit, discounting, and fulfillment performance |
| `mart_regional_margin` | One row per region | Regional revenue and profitability comparison |
| `mart_category_performance` | One row per category | Category revenue, profit, margin, discount, and fulfillment metrics |
| `mart_cohort_retention` | One row per cohort month and month number | Customer retention by signup cohort |
| `mart_revenue_forecast` | One row per future forecast month | Directional revenue forecast using a six-month linear trend |
| `mart_forecast_backtest` | One row per backtest month | Forecast versus actual revenue comparison |
| `mart_forecast_accuracy` | One row per method | MAE, MAPE, and forecast bias |
| `mart_anomaly_alerts` | One row per month and monitored metric | Rolling metric anomaly monitoring |

## Analysis Outputs

`data/analysis_outputs/` contains CSV extracts aligned with the SQL files in `sql/analysis/`. These outputs make the analytical findings reproducible without requiring every machine to have a local database installed.
