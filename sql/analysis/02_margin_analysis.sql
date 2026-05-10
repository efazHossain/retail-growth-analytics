-- Category and regional profitability comparison.

SELECT
  category,
  revenue,
  profit,
  margin_rate,
  avg_discount_rate,
  avg_fulfillment_days
FROM mart_category_performance
ORDER BY margin_rate DESC;

SELECT
  region,
  revenue,
  profit,
  margin_rate,
  avg_discount_rate,
  avg_fulfillment_days
FROM mart_regional_margin
ORDER BY margin_rate ASC;
