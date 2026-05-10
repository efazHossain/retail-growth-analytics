-- Current forward-looking revenue forecast.

SELECT
  month,
  forecast_revenue,
  method,
  note
FROM mart_revenue_forecast
ORDER BY month;
