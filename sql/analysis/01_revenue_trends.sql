-- Revenue trend mart: monthly growth, margin, and average order value.

SELECT
  month,
  orders,
  customers,
  revenue,
  profit,
  margin_rate,
  average_order_value,
  revenue - LAG(revenue) OVER (ORDER BY month) AS revenue_change,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY month))
    / NULLIF(LAG(revenue) OVER (ORDER BY month), 0),
    4
  ) AS revenue_growth_rate
FROM mart_monthly_revenue
ORDER BY month;
