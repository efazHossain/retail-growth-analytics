import path from "node:path";
import fs from "node:fs";
import { ensureDir, readCsv, writeCsv, writeJson } from "./lib/csv.js";
import { round } from "./lib/metrics.js";

const martsDir = path.join("data", "marts");
const outputsDir = path.join("data", "analysis_outputs");
const warehouseDir = path.join("data", "warehouse");
ensureDir(outputsDir);
ensureDir(warehouseDir);

const monthly = numericRows(readCsv(path.join(martsDir, "mart_monthly_revenue.csv")));
const categories = numericRows(readCsv(path.join(martsDir, "mart_category_performance.csv")));
const regions = numericRows(readCsv(path.join(martsDir, "mart_regional_margin.csv")));
const channels = numericRows(readCsv(path.join(martsDir, "mart_channel_performance.csv")));
const cohorts = numericRows(readCsv(path.join(martsDir, "mart_cohort_retention.csv")));
const forecast = numericRows(readCsv(path.join(martsDir, "mart_revenue_forecast.csv")));
const forecastBacktest = numericRows(readCsv(path.join(martsDir, "mart_forecast_backtest.csv")));
const forecastAccuracy = numericRows(readCsv(path.join(martsDir, "mart_forecast_accuracy.csv")));

writeCsv(path.join(outputsDir, "01_revenue_trends.csv"), revenueTrends(monthly));
writeCsv(path.join(outputsDir, "02_category_margin_analysis.csv"), categories.sort((a, b) => b.margin_rate - a.margin_rate));
writeCsv(path.join(outputsDir, "02_regional_margin_analysis.csv"), regions.sort((a, b) => a.margin_rate - b.margin_rate));
writeCsv(path.join(outputsDir, "03_channel_discounting.csv"), channels.sort((a, b) => b.avg_discount_rate - a.avg_discount_rate));
writeCsv(path.join(outputsDir, "04_cohort_retention.csv"), cohorts.filter((row) => row.month_number <= 5));
writeCsv(path.join(outputsDir, "05_forecast_plan.csv"), forecast);
writeCsv(path.join(outputsDir, "06_forecast_backtest.csv"), forecastBacktest);
writeCsv(path.join(outputsDir, "06_forecast_accuracy_summary.csv"), forecastAccuracy);

writeJson(path.join(warehouseDir, "warehouse_manifest.json"), {
  note: "Local CSV-backed warehouse manifest. Load data/marts/*.csv into DuckDB, SQLite, BigQuery, Snowflake, or Power BI.",
  source_marts: [
    "dim_customers",
    "dim_categories",
    "fact_orders",
    "mart_monthly_revenue",
    "mart_channel_performance",
    "mart_regional_margin",
    "mart_category_performance",
    "mart_cohort_retention",
    "mart_revenue_forecast",
    "mart_forecast_backtest",
    "mart_forecast_accuracy"
  ],
  analysis_outputs: [
    "01_revenue_trends.csv",
    "02_category_margin_analysis.csv",
    "02_regional_margin_analysis.csv",
    "03_channel_discounting.csv",
    "04_cohort_retention.csv",
    "05_forecast_plan.csv",
    "06_forecast_backtest.csv",
    "06_forecast_accuracy_summary.csv"
  ]
});

writeFindings();
console.log("Wrote SQL-style analysis outputs and warehouse manifest.");

function revenueTrends(rows) {
  return rows.map((row, index) => {
    const previous = rows[index - 1];
    const revenueChange = previous ? row.revenue - previous.revenue : "";
    return {
      month: row.month,
      orders: row.orders,
      customers: row.customers,
      revenue: row.revenue,
      profit: row.profit,
      margin_rate: row.margin_rate,
      average_order_value: row.average_order_value,
      revenue_change: previous ? round(revenueChange) : "",
      revenue_growth_rate: previous ? round(revenueChange / previous.revenue, 4) : ""
    };
  });
}

function numericRows(rows) {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        const asNumber = Number(value);
        return value !== "" && !Number.isNaN(asNumber) ? [key, asNumber] : [key, value];
      })
    )
  );
}

function writeFindings() {
  const trends = revenueTrends(monthly);
  const latest = trends.at(-1);
  const topCategory = categories.sort((a, b) => b.revenue - a.revenue)[0];
  const weakestRegion = regions.sort((a, b) => a.margin_rate - b.margin_rate)[0];
  const highestDiscountChannel = channels.sort((a, b) => b.avg_discount_rate - a.avg_discount_rate)[0];
  const monthOneRetention = cohorts.filter((row) => row.month_number === 1);
  const avgMonthOneRetention = monthOneRetention.reduce((total, row) => total + row.retention_rate, 0) / monthOneRetention.length;
  const accuracy = forecastAccuracy[0];

  const markdown = `# Findings

This document summarizes the current analysis outputs in \`data/analysis_outputs/\`.

## Revenue Trend

Latest monthly revenue is ${money(latest.revenue)}, with ${(latest.revenue_growth_rate * 100).toFixed(1)}% growth versus the prior month.

## Profitability

${topCategory.category} is the largest revenue category at ${money(topCategory.revenue)}. ${weakestRegion.region} has the lowest regional margin rate at ${(weakestRegion.margin_rate * 100).toFixed(1)}%, so it is the first place to investigate pricing, fulfillment cost, or discount leakage.

## Discounting

${highestDiscountChannel.channel} has the highest average discount rate at ${(highestDiscountChannel.avg_discount_rate * 100).toFixed(1)}%. That channel should be monitored because discounting can grow revenue while hiding margin pressure.

## Customer Behavior

Average month-one cohort retention is ${(avgMonthOneRetention * 100).toFixed(1)}%. This gives the project a customer behavior lens beyond sales reporting.

## Forecast Tracking

The six-month linear trend forecast backtest has ${money(accuracy.mean_absolute_error)} MAE and ${(accuracy.mean_absolute_percentage_error * 100).toFixed(1)}% MAPE across ${accuracy.backtest_months} backtest months.

## Next Analysis Question

The next analytical step is to combine cohort retention with customer value tiers from the Python layer. That would show whether high-value customers are also retained better over time.
`;

  ensureDir("docs");
  fs.writeFileSync(path.join("docs", "findings.md"), markdown);
}

function money(value) {
  return `$${Math.round(value).toLocaleString()}`;
}
