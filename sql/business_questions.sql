-- Business questions this project is designed to answer.
-- The CSV files can be loaded into SQLite, DuckDB, BigQuery, Snowflake, or PostgreSQL.

-- 1. Monthly revenue, profit, and margin trend
SELECT
  SUBSTR(order_date, 1, 7) AS order_month,
  COUNT(*) AS orders,
  ROUND(SUM(revenue), 2) AS revenue,
  ROUND(SUM(revenue - cost), 2) AS profit,
  ROUND(SUM(revenue - cost) / SUM(revenue), 3) AS margin_rate
FROM orders
GROUP BY 1
ORDER BY 1;

-- 2. Category performance by revenue and profitability
SELECT
  category,
  COUNT(*) AS orders,
  SUM(units) AS units,
  ROUND(SUM(revenue), 2) AS revenue,
  ROUND(SUM(revenue - cost), 2) AS profit,
  ROUND(SUM(revenue - cost) / SUM(revenue), 3) AS margin_rate
FROM orders
GROUP BY 1
ORDER BY revenue DESC;

-- 3. Discount leakage by sales channel
SELECT
  channel,
  ROUND(AVG(discount_rate), 3) AS avg_discount_rate,
  ROUND(SUM(revenue), 2) AS revenue,
  ROUND(SUM(revenue - cost) / SUM(revenue), 3) AS margin_rate
FROM orders
GROUP BY 1
ORDER BY avg_discount_rate DESC;

-- 4. Regional opportunity sizing
SELECT
  region,
  COUNT(DISTINCT customer_id) AS active_customers,
  ROUND(SUM(revenue), 2) AS revenue,
  ROUND(SUM(revenue) / COUNT(DISTINCT customer_id), 2) AS revenue_per_customer
FROM orders
GROUP BY 1
ORDER BY revenue_per_customer DESC;
