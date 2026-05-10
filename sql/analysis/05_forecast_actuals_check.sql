-- Lightweight forecast governance pattern.
-- In a production warehouse, this would compare stored forecast snapshots
-- against future actuals after each month closes.

SELECT
  month,
  forecast_revenue,
  method,
  note
FROM mart_revenue_forecast
ORDER BY month;
