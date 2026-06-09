#!/bin/sh
set -eu

: "${DATABASE_URL:=postgres://retail:retail@postgres:5432/retail_intelligence}"

echo "Waiting for Postgres..."
until psql "$DATABASE_URL" -c "select 1" >/dev/null 2>&1; do
  sleep 1
done

echo "Applying schema..."
psql "$DATABASE_URL" -f /schema/001_init.sql

echo "Loading retail marts from /marts..."

psql "$DATABASE_URL" <<'SQL'
TRUNCATE TABLE
  retail.mart_monthly_revenue,
  retail.mart_category_performance,
  retail.mart_regional_margin,
  retail.mart_channel_performance,
  retail.mart_cohort_retention,
  retail.mart_forecast_accuracy,
  retail.mart_forecast_backtest,
  retail.mart_anomaly_alerts;
SQL

load_mart() {
  table_name="$1"
  file_name="$2"
  columns="$3"
  file_path="/marts/$file_name"

  if [ ! -f "$file_path" ]; then
    echo "Skipping $table_name: /marts/$file_name not found."
    return
  fi

  echo "Loading $table_name from $file_name..."
  psql "$DATABASE_URL" -c "\\copy retail.$table_name ($columns) FROM '$file_path' WITH (FORMAT csv, HEADER true)"
  row_count="$(psql "$DATABASE_URL" -At -c "select count(*) from retail.$table_name")"
  echo "Loaded $row_count rows into retail.$table_name."
}

load_mart "mart_monthly_revenue" "mart_monthly_revenue.csv" "month, orders, customers, units, revenue, cost, profit, discount_rate, fulfillment_days, average_order_value, margin_rate, avg_discount_rate, avg_fulfillment_days"
load_mart "mart_category_performance" "mart_category_performance.csv" "category, orders, customers, units, revenue, cost, profit, discount_rate, fulfillment_days, average_order_value, margin_rate, avg_discount_rate, avg_fulfillment_days"
load_mart "mart_regional_margin" "mart_regional_margin.csv" "region, orders, customers, units, revenue, cost, profit, discount_rate, fulfillment_days, average_order_value, margin_rate, avg_discount_rate, avg_fulfillment_days"
load_mart "mart_channel_performance" "mart_channel_performance.csv" "channel, orders, customers, units, revenue, cost, profit, discount_rate, fulfillment_days, average_order_value, margin_rate, avg_discount_rate, avg_fulfillment_days"
load_mart "mart_cohort_retention" "mart_cohort_retention.csv" "cohort_month, month_number, cohort_size, active_customers, retention_rate"
load_mart "mart_forecast_accuracy" "mart_forecast_accuracy.csv" "method, backtest_months, mean_absolute_error, mean_absolute_percentage_error, average_forecast_bias, note"
load_mart "mart_forecast_backtest" "mart_forecast_backtest.csv" "month, training_start_month, training_end_month, actual_revenue, forecast_revenue, forecast_error, absolute_error, absolute_percentage_error, method"
load_mart "mart_anomaly_alerts" "mart_anomaly_alerts.csv" "month, metric_name, metric_field, current_value, baseline_average, baseline_stddev, z_score, threshold, alert_flag, severity, note"

echo "Retail marts loaded."
