import fs from "node:fs";
import path from "node:path";
import { ensureDir, readCsv, writeJson } from "./lib/csv.js";
import { money, round, sum } from "./lib/metrics.js";

const processedDir = path.join("data", "processed");
ensureDir(processedDir);

const monthly = numericRows(readCsv(path.join("data", "marts", "mart_monthly_revenue.csv")));
const byCategory = numericRows(readCsv(path.join("data", "marts", "mart_category_performance.csv")));
const byChannel = numericRows(readCsv(path.join("data", "marts", "mart_channel_performance.csv")));
const byRegion = numericRows(readCsv(path.join("data", "marts", "mart_regional_margin.csv")));
const cohortRetention = numericRows(readCsv(path.join("data", "marts", "mart_cohort_retention.csv")));
const revenueForecast = numericRows(readCsv(path.join("data", "marts", "mart_revenue_forecast.csv")));
const forecastBacktest = numericRows(readCsv(path.join("data", "marts", "mart_forecast_backtest.csv")));
const forecastAccuracy = numericRows(readCsv(path.join("data", "marts", "mart_forecast_accuracy.csv")));
const anomalyAlerts = numericRows(readCsv(path.join("data", "marts", "mart_anomaly_alerts.csv")));
const validation = readCsv(path.join("data", "quality", "validation_results.csv"));

const kpis = {
  orders: sum(monthly, "orders"),
  customers: Math.max(...monthly.map((row) => row.customers)),
  revenue: sum(monthly, "revenue"),
  profit: sum(monthly, "profit"),
  average_order_value: round(sum(monthly, "revenue") / sum(monthly, "orders")),
  gross_margin_rate: round(sum(monthly, "profit") / sum(monthly, "revenue"), 4),
  average_fulfillment_days: round(monthly.reduce((total, row) => total + row.avg_fulfillment_days, 0) / monthly.length, 2),
  validation_pass_rate: round(validation.filter((row) => row.status === "pass").length / validation.length, 4)
};

const summary = {
  kpis,
  monthly,
  byCategory,
  byChannel,
  byRegion,
  cohortRetention,
  revenueForecast,
  forecastBacktest,
  forecastAccuracy,
  anomalyAlerts,
  validation
};

writeJson(path.join(processedDir, "summary.json"), summary);
writeExecutiveSummary(summary);
console.log("Wrote data/processed/summary.json and executive-summary.md.");

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

function writeExecutiveSummary({ kpis, monthly, byCategory, byChannel, byRegion, cohortRetention, revenueForecast, forecastAccuracy, anomalyAlerts }) {
  const latest = monthly.at(-1);
  const previous = monthly.at(-2);
  const growth = ((latest.revenue - previous.revenue) / previous.revenue) * 100;
  const topCategory = byCategory[0];
  const weakestRegion = byRegion[0];
  const topChannel = byChannel[0];
  const monthOneRetention = cohortRetention.filter((row) => row.month_number === 1);
  const avgMonthOneRetention = monthOneRetention.reduce((total, row) => total + row.retention_rate, 0) / monthOneRetention.length;
  const firstForecast = revenueForecast[0];
  const accuracy = forecastAccuracy[0];
  const alertCount = anomalyAlerts.filter((row) => row.alert_flag === "alert").length;

  const markdown = `# Executive Summary

Revenue reached ${money(kpis.revenue)} across ${kpis.orders.toLocaleString()} orders, with a ${(kpis.gross_margin_rate * 100).toFixed(1)}% gross margin rate and ${money(kpis.average_order_value)} average order value.

## Business Findings

- Latest monthly revenue was ${money(latest.revenue)}, ${growth.toFixed(1)}% versus the prior month.
- ${topCategory.category} is the largest category by revenue at ${money(topCategory.revenue)}.
- ${topChannel.channel} is the largest channel at ${money(topChannel.revenue)} in revenue.
- ${weakestRegion.region} has the lowest margin rate at ${(weakestRegion.margin_rate * 100).toFixed(1)}%, making it the first region to investigate for pricing, fulfillment cost, or discount leakage.
- Month-one cohort retention averages ${(avgMonthOneRetention * 100).toFixed(1)}%, adding a customer behavior lens beyond basic sales reporting.
- A simple six-month trend forecast estimates ${money(firstForecast.forecast_revenue)} in revenue for ${firstForecast.month}.
- The rolling forecast backtest has ${(accuracy.mean_absolute_percentage_error * 100).toFixed(1)}% MAPE across ${accuracy.backtest_months} months.
- Rolling anomaly monitoring flagged ${alertCount} metric-month combinations across revenue, margin, discounting, and fulfillment.

## Recommended Actions

1. Protect margin by reviewing discount rules in lower-margin regions and marketplace orders.
2. Allocate campaign budget toward the highest-margin category and channel combinations.
3. Track fulfillment days as an operational KPI because slower delivery can weaken repeat purchase behavior.
4. Keep the trend forecast as a planning signal, but validate it against future actuals before using it for decisions.
5. Track forecast accuracy monthly so planning assumptions improve over time.
6. Review anomaly alerts after every build to catch unusual metric movement before it reaches reporting.
`;

  fs.writeFileSync(path.join(processedDir, "executive-summary.md"), markdown);
}
