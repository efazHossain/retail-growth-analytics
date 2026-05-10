# Data Dictionary

This dictionary documents the main curated tables used for analysis and dashboarding.

## `fact_orders`

| Column | Description |
| --- | --- |
| `order_id` | Unique order identifier |
| `order_date` | Order date |
| `order_month` | Month extracted from order date |
| `customer_id` | Customer identifier |
| `category_id` | Category dimension key |
| `region` | Customer/order region |
| `channel` | Sales channel |
| `units` | Units sold |
| `revenue` | Order revenue after discount |
| `cost` | Order cost |
| `profit` | Revenue minus cost |
| `margin_rate` | Profit divided by revenue |
| `discount_rate` | Order discount rate |
| `fulfillment_days` | Days from order to fulfillment |

## `dim_customers`

| Column | Description |
| --- | --- |
| `customer_id` | Unique customer identifier |
| `region` | Customer region |
| `segment` | Customer segment |
| `signup_date` | Customer signup date |
| `signup_month` | Customer signup month |
| `first_order_date` | First observed order date |
| `last_order_date` | Most recent observed order date |
| `lifetime_orders` | Total observed orders |
| `lifetime_revenue` | Total observed customer revenue |
| `lifetime_profit` | Total observed customer profit |

## `mart_monthly_revenue`

| Column | Description |
| --- | --- |
| `month` | Reporting month |
| `orders` | Order count |
| `customers` | Distinct active customers |
| `units` | Units sold |
| `revenue` | Total revenue |
| `cost` | Total cost |
| `profit` | Total profit |
| `average_order_value` | Revenue divided by orders |
| `margin_rate` | Profit divided by revenue |
| `avg_discount_rate` | Average order discount rate |
| `avg_fulfillment_days` | Average fulfillment days |

## `mart_anomaly_alerts`

| Column | Description |
| --- | --- |
| `month` | Month being evaluated |
| `metric_name` | Human-readable metric name |
| `metric_field` | Source metric field |
| `current_value` | Current month value |
| `baseline_average` | Prior six-month average |
| `baseline_stddev` | Prior six-month standard deviation |
| `z_score` | Current movement versus baseline |
| `threshold` | Alert threshold |
| `alert_flag` | `alert` or `normal` |
| `severity` | `normal`, `medium`, or `high` |
| `note` | Plain-language explanation |

## `mart_forecast_accuracy`

| Column | Description |
| --- | --- |
| `method` | Forecast method |
| `backtest_months` | Number of tested months |
| `mean_absolute_error` | Average absolute forecast error |
| `mean_absolute_percentage_error` | Average absolute percentage error |
| `average_forecast_bias` | Average actual minus forecast |
| `note` | Backtest note |
