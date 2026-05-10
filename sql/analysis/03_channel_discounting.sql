-- Discount leakage review by channel.

SELECT
  channel,
  orders,
  revenue,
  profit,
  margin_rate,
  avg_discount_rate,
  average_order_value
FROM mart_channel_performance
ORDER BY avg_discount_rate DESC;
