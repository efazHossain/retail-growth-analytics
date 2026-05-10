import fs from "node:fs";
import path from "node:path";

const rawDir = path.join("data", "raw");
const processedDir = path.join("data", "processed");
fs.mkdirSync(processedDir, { recursive: true });

function parseCsv(filePath) {
  const [headerLine, ...lines] = fs.readFileSync(filePath, "utf8").trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

const orders = parseCsv(path.join(rawDir, "orders.csv")).map((row) => ({
  ...row,
  units: Number(row.units),
  revenue: Number(row.revenue),
  cost: Number(row.cost),
  discount_rate: Number(row.discount_rate),
  fulfillment_days: Number(row.fulfillment_days),
  month: row.order_date.slice(0, 7),
  profit: Number((Number(row.revenue) - Number(row.cost)).toFixed(2))
}));

function groupBy(rows, keyFn, metricFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!map.has(key)) {
      map.set(key, metricFn());
    }
    metricFn(map.get(key), row);
  }
  return [...map.values()];
}

const kpis = {
  orders: orders.length,
  revenue: sum(orders, "revenue"),
  profit: sum(orders, "profit"),
  average_order_value: Number((sum(orders, "revenue") / orders.length).toFixed(2)),
  gross_margin_rate: Number((sum(orders, "profit") / sum(orders, "revenue")).toFixed(3)),
  average_fulfillment_days: Number((sum(orders, "fulfillment_days") / orders.length).toFixed(1))
};

const monthly = groupBy(
  orders,
  (row) => row.month,
  (acc, row) => {
    if (!acc) return { month: "", orders: 0, revenue: 0, profit: 0, units: 0 };
    acc.month = row.month;
    acc.orders += 1;
    acc.revenue += row.revenue;
    acc.profit += row.profit;
    acc.units += row.units;
  }
).map(roundMetrics).sort((a, b) => a.month.localeCompare(b.month));

const byCategory = summarizeBy("category");
const byChannel = summarizeBy("channel");
const byRegion = summarizeBy("region");
const markdown = buildMarkdown({ kpis, monthly, byCategory, byChannel, byRegion });

fs.writeFileSync(path.join(processedDir, "summary.json"), JSON.stringify({ kpis, monthly, byCategory, byChannel, byRegion }, null, 2));
fs.writeFileSync(path.join(processedDir, "executive-summary.md"), markdown);
console.log("Wrote data/processed/summary.json and executive-summary.md.");

function summarizeBy(field) {
  return groupBy(
    orders,
    (row) => row[field],
    (acc, row) => {
      if (!acc) return { [field]: "", orders: 0, revenue: 0, profit: 0, units: 0, avg_discount: 0 };
      acc[field] = row[field];
      acc.orders += 1;
      acc.revenue += row.revenue;
      acc.profit += row.profit;
      acc.units += row.units;
      acc.avg_discount += row.discount_rate;
    }
  )
    .map((row) => ({
      ...roundMetrics(row),
      avg_discount: Number((row.avg_discount / row.orders).toFixed(3)),
      margin_rate: Number((row.profit / row.revenue).toFixed(3))
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

function sum(rows, field) {
  return Number(rows.reduce((total, row) => total + row[field], 0).toFixed(2));
}

function roundMetrics(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, typeof value === "number" ? Number(value.toFixed(2)) : value])
  );
}

function money(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function buildMarkdown({ kpis, monthly, byCategory, byChannel, byRegion }) {
  const latest = monthly.at(-1);
  const previous = monthly.at(-2);
  const growth = ((latest.revenue - previous.revenue) / previous.revenue) * 100;
  const topCategory = byCategory[0];
  const weakestRegion = [...byRegion].sort((a, b) => a.margin_rate - b.margin_rate)[0];
  const topChannel = byChannel[0];

  return `# Executive Summary

Revenue reached ${money(kpis.revenue)} across ${kpis.orders.toLocaleString()} orders, with a ${Math.round(kpis.gross_margin_rate * 100)}% gross margin rate and ${money(kpis.average_order_value)} average order value.

## Business Findings

- Latest monthly revenue was ${money(latest.revenue)}, ${growth.toFixed(1)}% versus the prior month.
- ${topCategory.category} is the largest category by revenue at ${money(topCategory.revenue)}.
- ${topChannel.channel} is the largest channel, but discounting should be monitored because channel mix can compress margin.
- ${weakestRegion.region} has the lowest margin rate at ${(weakestRegion.margin_rate * 100).toFixed(1)}%, making it the first region to investigate for pricing, fulfillment cost, or discount leakage.

## Recommended Actions

1. Protect margin by reviewing discount rules in lower-margin regions and marketplace orders.
2. Allocate campaign budget toward the highest-margin category and channel combinations.
3. Track fulfillment days as an operational KPI because slower delivery can weaken repeat purchase behavior.
`;
}
