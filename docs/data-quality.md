# Data Quality

The project includes lightweight validation checks that run after marts are built.

Run:

```powershell
node scripts/validate-data.js
```

Outputs:

- `data/quality/validation_results.csv`
- `data/quality/validation_summary.json`

## Current Checks

- `stg_orders.order_id` is unique
- `stg_customers.customer_id` is unique
- `stg_orders.customer_id` is not null
- `stg_orders.order_date` is not null
- `stg_orders.customer_id` exists in `stg_customers`
- `stg_orders.revenue` is non-negative
- `stg_orders.cost` is non-negative
- `stg_orders.discount_rate` is between `0` and `0.5`
- `fact_orders.margin_rate` is between `0` and `0.8`
- `stg_orders.fulfillment_days` is between `1` and `14`

## Why This Matters

The goal is not only to make charts. The goal is to build trust in the tables that feed those charts. These checks make data assumptions visible and help catch broken inputs before they reach the dashboard.
