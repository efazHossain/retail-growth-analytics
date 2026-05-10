import path from "node:path";
import { ensureDir, readCsv, writeCsv } from "./lib/csv.js";
import { round } from "./lib/metrics.js";

const rawDir = path.join("data", "raw");
const stagingDir = path.join("data", "staging");
ensureDir(stagingDir);

const customers = readCsv(path.join(rawDir, "customers.csv")).map((row) => ({
  customer_id: row.customer_id.trim(),
  region: row.region.trim(),
  segment: row.segment.trim(),
  signup_date: row.signup_date,
  signup_month: row.signup_date.slice(0, 7)
}));

const orders = readCsv(path.join(rawDir, "orders.csv")).map((row) => {
  const revenue = Number(row.revenue);
  const cost = Number(row.cost);
  return {
    order_id: row.order_id.trim(),
    order_date: row.order_date,
    order_month: row.order_date.slice(0, 7),
    customer_id: row.customer_id.trim(),
    region: row.region.trim(),
    channel: row.channel.trim(),
    category: row.category.trim(),
    units: Number(row.units),
    revenue: round(revenue),
    cost: round(cost),
    profit: round(revenue - cost),
    discount_rate: Number(row.discount_rate),
    fulfillment_days: Number(row.fulfillment_days)
  };
});

const categories = [...new Set(orders.map((row) => row.category))]
  .sort()
  .map((category, index) => ({
    category_id: `CAT${String(index + 1).padStart(3, "0")}`,
    category
  }));

writeCsv(path.join(stagingDir, "stg_customers.csv"), customers);
writeCsv(path.join(stagingDir, "stg_orders.csv"), orders);
writeCsv(path.join(stagingDir, "stg_categories.csv"), categories);

console.log(`Built staging layer: ${customers.length} customers, ${orders.length} orders, ${categories.length} categories.`);
