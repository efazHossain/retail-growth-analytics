-- Forecast backtest and accuracy summary.
-- This compares each available month against a forecast trained on the prior
-- six months.

SELECT
  month,
  training_start_month,
  training_end_month,
  actual_revenue,
  forecast_revenue,
  forecast_error,
  absolute_error,
  absolute_percentage_error,
  method
FROM mart_forecast_backtest
ORDER BY month;

SELECT
  method,
  backtest_months,
  mean_absolute_error,
  mean_absolute_percentage_error,
  average_forecast_bias,
  note
FROM mart_forecast_accuracy;
