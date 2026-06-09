-- Serving schema for the Retail Intelligence Platform.
-- Existing CSV marts in data/marts remain the source of truth for Phase 2.

CREATE SCHEMA IF NOT EXISTS retail;

CREATE TABLE IF NOT EXISTS retail.mart_monthly_revenue (
  month TEXT PRIMARY KEY,
  orders INTEGER,
  customers INTEGER,
  units INTEGER,
  revenue NUMERIC(14, 2),
  cost NUMERIC(14, 2),
  profit NUMERIC(14, 2),
  discount_rate NUMERIC(14, 4),
  fulfillment_days NUMERIC(14, 2),
  average_order_value NUMERIC(14, 2),
  margin_rate NUMERIC(8, 4),
  avg_discount_rate NUMERIC(8, 4),
  avg_fulfillment_days NUMERIC(8, 2)
);

CREATE TABLE IF NOT EXISTS retail.mart_category_performance (
  category TEXT PRIMARY KEY,
  orders INTEGER,
  customers INTEGER,
  units INTEGER,
  revenue NUMERIC(14, 2),
  cost NUMERIC(14, 2),
  profit NUMERIC(14, 2),
  discount_rate NUMERIC(14, 4),
  fulfillment_days NUMERIC(14, 2),
  average_order_value NUMERIC(14, 2),
  margin_rate NUMERIC(8, 4),
  avg_discount_rate NUMERIC(8, 4),
  avg_fulfillment_days NUMERIC(8, 2)
);

ALTER TABLE retail.mart_monthly_revenue
  ADD COLUMN IF NOT EXISTS discount_rate NUMERIC(14, 4),
  ADD COLUMN IF NOT EXISTS fulfillment_days NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS avg_discount_rate NUMERIC(8, 4),
  ADD COLUMN IF NOT EXISTS avg_fulfillment_days NUMERIC(8, 2);

ALTER TABLE retail.mart_category_performance
  ADD COLUMN IF NOT EXISTS discount_rate NUMERIC(14, 4),
  ADD COLUMN IF NOT EXISTS fulfillment_days NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS avg_discount_rate NUMERIC(8, 4),
  ADD COLUMN IF NOT EXISTS avg_fulfillment_days NUMERIC(8, 2);

CREATE TABLE IF NOT EXISTS retail.mart_regional_margin (
  region TEXT PRIMARY KEY,
  orders INTEGER,
  customers INTEGER,
  units INTEGER,
  revenue NUMERIC(14, 2),
  cost NUMERIC(14, 2),
  profit NUMERIC(14, 2),
  discount_rate NUMERIC(14, 4),
  fulfillment_days NUMERIC(14, 2),
  average_order_value NUMERIC(14, 2),
  margin_rate NUMERIC(8, 4),
  avg_discount_rate NUMERIC(8, 4),
  avg_fulfillment_days NUMERIC(8, 2)
);

CREATE TABLE IF NOT EXISTS retail.mart_channel_performance (
  channel TEXT PRIMARY KEY,
  orders INTEGER,
  customers INTEGER,
  units INTEGER,
  revenue NUMERIC(14, 2),
  cost NUMERIC(14, 2),
  profit NUMERIC(14, 2),
  discount_rate NUMERIC(14, 4),
  fulfillment_days NUMERIC(14, 2),
  average_order_value NUMERIC(14, 2),
  margin_rate NUMERIC(8, 4),
  avg_discount_rate NUMERIC(8, 4),
  avg_fulfillment_days NUMERIC(8, 2)
);

CREATE TABLE IF NOT EXISTS retail.mart_cohort_retention (
  cohort_month TEXT,
  month_number INTEGER,
  cohort_size INTEGER,
  active_customers INTEGER,
  retention_rate NUMERIC(8, 4),
  PRIMARY KEY (cohort_month, month_number)
);

CREATE TABLE IF NOT EXISTS retail.mart_forecast_accuracy (
  method TEXT PRIMARY KEY,
  backtest_months INTEGER,
  mean_absolute_error NUMERIC(14, 2),
  mean_absolute_percentage_error NUMERIC(8, 4),
  average_forecast_bias NUMERIC(14, 2),
  note TEXT
);

CREATE TABLE IF NOT EXISTS retail.mart_forecast_backtest (
  month TEXT PRIMARY KEY,
  training_start_month TEXT,
  training_end_month TEXT,
  actual_revenue NUMERIC(14, 2),
  forecast_revenue NUMERIC(14, 2),
  forecast_error NUMERIC(14, 2),
  absolute_error NUMERIC(14, 2),
  absolute_percentage_error NUMERIC(8, 4),
  method TEXT
);

CREATE TABLE IF NOT EXISTS retail.mart_anomaly_alerts (
  month TEXT,
  metric_name TEXT,
  metric_field TEXT,
  current_value NUMERIC(14, 4),
  baseline_average NUMERIC(14, 4),
  baseline_stddev NUMERIC(14, 4),
  z_score NUMERIC(10, 4),
  threshold NUMERIC(10, 4),
  alert_flag TEXT,
  severity TEXT,
  note TEXT,
  PRIMARY KEY (month, metric_field)
);
