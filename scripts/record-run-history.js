import path from "node:path";
import { ensureDir, readCsv, writeCsv, writeJson } from "./lib/csv.js";

const runHistoryDir = path.join("data", "run_history");
ensureDir(runHistoryDir);

const rawOrders = readCsv(path.join("data", "raw", "orders.csv"));
const rawCustomers = readCsv(path.join("data", "raw", "customers.csv"));
const stagingOrders = readCsv(path.join("data", "staging", "stg_orders.csv"));
const stagingCustomers = readCsv(path.join("data", "staging", "stg_customers.csv"));
const factOrders = readCsv(path.join("data", "marts", "fact_orders.csv"));
const validation = readCsv(path.join("data", "quality", "validation_results.csv"));
const anomalies = readCsv(path.join("data", "marts", "mart_anomaly_alerts.csv"));
const manifest = JSON.parse(await readText(path.join("data", "marts", "manifest.json")));

const historyPath = path.join(runHistoryDir, "pipeline_runs.csv");
const history = readOptionalCsv(historyPath);
const nextRunNumber = history.length + 1;
const latest = {
  run_id: `local-${String(nextRunNumber).padStart(4, "0")}`,
  run_sequence: nextRunNumber,
  run_timestamp_utc: process.env.CI ? "ci-run" : "local-run",
  build_status: "success",
  raw_orders: rawOrders.length,
  raw_customers: rawCustomers.length,
  staging_orders: stagingOrders.length,
  staging_customers: stagingCustomers.length,
  fact_orders: factOrders.length,
  curated_model_count: manifest.models.length,
  validation_checks: validation.length,
  validation_failures: validation.filter((row) => row.status !== "pass").length,
  anomaly_alerts: anomalies.filter((row) => row.alert_flag === "alert").length
};

const updatedHistory = [...history.filter((row) => row.run_id !== latest.run_id), latest];
writeCsv(historyPath, updatedHistory);
writeJson(path.join(runHistoryDir, "latest_run.json"), latest);

console.log(`Recorded pipeline run ${latest.run_id} with ${latest.validation_failures} validation failures and ${latest.anomaly_alerts} anomaly alerts.`);

function readOptionalCsv(filePath) {
  try {
    return readCsv(filePath);
  } catch {
    return [];
  }
}

async function readText(filePath) {
  const fs = await import("node:fs/promises");
  return fs.readFile(filePath, "utf8");
}
