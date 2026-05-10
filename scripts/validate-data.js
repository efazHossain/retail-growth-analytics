import path from "node:path";
import { ensureDir, readCsv, writeCsv, writeJson } from "./lib/csv.js";

const qualityDir = path.join("data", "quality");
ensureDir(qualityDir);

const customers = readCsv(path.join("data", "staging", "stg_customers.csv"));
const orders = readCsv(path.join("data", "staging", "stg_orders.csv"));
const factOrders = readCsv(path.join("data", "marts", "fact_orders.csv"));
const customerIds = new Set(customers.map((row) => row.customer_id));

const checks = [
  uniqueness("stg_orders.order_id unique", orders, "order_id"),
  uniqueness("stg_customers.customer_id unique", customers, "customer_id"),
  notNull("stg_orders.customer_id not null", orders, "customer_id"),
  notNull("stg_orders.order_date not null", orders, "order_date"),
  validForeignKey("stg_orders.customer_id exists in stg_customers", orders, "customer_id", customerIds),
  numericRange("stg_orders.revenue non-negative", orders, "revenue", 0, Infinity),
  numericRange("stg_orders.cost non-negative", orders, "cost", 0, Infinity),
  numericRange("stg_orders.discount_rate between 0 and 0.5", orders, "discount_rate", 0, 0.5),
  numericRange("fact_orders.margin_rate between 0 and 0.8", factOrders, "margin_rate", 0, 0.8),
  numericRange("stg_orders.fulfillment_days between 1 and 14", orders, "fulfillment_days", 1, 14)
];

const failed = checks.filter((check) => check.status === "fail");
writeCsv(path.join(qualityDir, "validation_results.csv"), checks);
writeJson(path.join(qualityDir, "validation_summary.json"), {
  checks: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length
});

if (failed.length > 0) {
  console.error(`Validation failed: ${failed.length} check(s) did not pass.`);
  process.exit(1);
}

console.log(`Validation passed: ${checks.length} checks.`);

function base(name, failedRows, totalRows) {
  return {
    check_name: name,
    status: failedRows === 0 ? "pass" : "fail",
    failed_rows: failedRows,
    total_rows: totalRows
  };
}

function uniqueness(name, rows, field) {
  const seen = new Set();
  let duplicates = 0;
  for (const row of rows) {
    if (seen.has(row[field])) duplicates += 1;
    seen.add(row[field]);
  }
  return base(name, duplicates, rows.length);
}

function notNull(name, rows, field) {
  return base(name, rows.filter((row) => row[field] === undefined || row[field] === "").length, rows.length);
}

function validForeignKey(name, rows, field, validValues) {
  return base(name, rows.filter((row) => !validValues.has(row[field])).length, rows.length);
}

function numericRange(name, rows, field, min, max) {
  return base(
    name,
    rows.filter((row) => {
      const value = Number(row[field]);
      return Number.isNaN(value) || value < min || value > max;
    }).length,
    rows.length
  );
}
