-- Cohort retention curve for customer behavior analysis.

SELECT
  cohort_month,
  month_number,
  cohort_size,
  active_customers,
  retention_rate
FROM mart_cohort_retention
WHERE month_number <= 5
ORDER BY cohort_month, month_number;
