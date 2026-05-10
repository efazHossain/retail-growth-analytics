-- Rolling anomaly monitoring for revenue, margin, discounting, and fulfillment.

SELECT
  month,
  metric_name,
  current_value,
  baseline_average,
  baseline_stddev,
  z_score,
  threshold,
  alert_flag,
  severity,
  note
FROM mart_anomaly_alerts
WHERE alert_flag = 'alert'
ORDER BY month, metric_name;
