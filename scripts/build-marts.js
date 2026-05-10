import path from "node:path";
import { ensureDir, readCsv, writeCsv, writeJson } from "./lib/csv.js";
import { average, groupBy, monthDiff, round, sum } from "./lib/metrics.js";

const stagingDir = path.join("data", "staging");
const martsDir = path.join("data", "marts");
ensureDir(martsDir);

const customers = readCsv(path.join(stagingDir, "stg_customers.csv"));
const categories = readCsv(path.join(stagingDir, "stg_categories.csv"));
const categoryByName = new Map(categories.map((row) => [row.category, row.category_id]));
const customerById = new Map(customers.map((row) => [row.customer_id, row]));

const orders = readCsv(path.join(stagingDir, "stg_orders.csv")).map((row) => ({
  ...row,
  units: Number(row.units),
  revenue: Number(row.revenue),
  cost: Number(row.cost),
  profit: Number(row.profit),
  discount_rate: Number(row.discount_rate),
  fulfillment_days: Number(row.fulfillment_days)
}));

const dimCustomers = customers.map((customer) => {
  const customerOrders = orders.filter((order) => order.customer_id === customer.customer_id);
  const firstOrderDate = min(customerOrders.map((order) => order.order_date));
  const lastOrderDate = max(customerOrders.map((order) => order.order_date));
  return {
    customer_id: customer.customer_id,
    region: customer.region,
    segment: customer.segment,
    signup_date: customer.signup_date,
    signup_month: customer.signup_month,
    first_order_date: firstOrderDate,
    last_order_date: lastOrderDate,
    lifetime_orders: customerOrders.length,
    lifetime_revenue: round(sum(customerOrders, "revenue")),
    lifetime_profit: round(sum(customerOrders, "profit"))
  };
});

const dimCategories = categories.map((category) => ({
  category_id: category.category_id,
  category: category.category
}));

const factOrders = orders.map((order) => ({
  order_id: order.order_id,
  order_date: order.order_date,
  order_month: order.order_month,
  customer_id: order.customer_id,
  category_id: categoryByName.get(order.category),
  region: order.region,
  channel: order.channel,
  units: order.units,
  revenue: order.revenue,
  cost: order.cost,
  profit: order.profit,
  margin_rate: round(order.profit / order.revenue, 4),
  discount_rate: order.discount_rate,
  fulfillment_days: order.fulfillment_days
}));

const martMonthlyRevenue = summarize(orders, "order_month")
  .map((row) => ({ month: row.order_month, ...without(row, "order_month") }))
  .sort((a, b) => a.month.localeCompare(b.month));

const martChannelPerformance = summarize(orders, "channel").sort((a, b) => b.revenue - a.revenue);
const martRegionalMargin = summarize(orders, "region").sort((a, b) => a.margin_rate - b.margin_rate);
const martCategoryPerformance = summarize(orders, "category").sort((a, b) => b.revenue - a.revenue);
const martCohortRetention = buildCohortRetention(customers, orders);
const martRevenueForecast = buildForecast(martMonthlyRevenue);
const martForecastBacktest = buildForecastBacktest(martMonthlyRevenue);
const martForecastAccuracy = summarizeForecastAccuracy(martForecastBacktest);
const martAnomalyAlerts = buildAnomalyAlerts(martMonthlyRevenue);

writeCsv(path.join(martsDir, "dim_customers.csv"), dimCustomers);
writeCsv(path.join(martsDir, "dim_categories.csv"), dimCategories);
writeCsv(path.join(martsDir, "fact_orders.csv"), factOrders);
writeCsv(path.join(martsDir, "mart_monthly_revenue.csv"), martMonthlyRevenue);
writeCsv(path.join(martsDir, "mart_channel_performance.csv"), martChannelPerformance);
writeCsv(path.join(martsDir, "mart_regional_margin.csv"), martRegionalMargin);
writeCsv(path.join(martsDir, "mart_category_performance.csv"), martCategoryPerformance);
writeCsv(path.join(martsDir, "mart_cohort_retention.csv"), martCohortRetention);
writeCsv(path.join(martsDir, "mart_revenue_forecast.csv"), martRevenueForecast);
writeCsv(path.join(martsDir, "mart_forecast_backtest.csv"), martForecastBacktest);
writeCsv(path.join(martsDir, "mart_forecast_accuracy.csv"), martForecastAccuracy);
writeCsv(path.join(martsDir, "mart_anomaly_alerts.csv"), martAnomalyAlerts);
writeJson(path.join(martsDir, "manifest.json"), {
  models: [
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
    "mart_forecast_accuracy",
    "mart_anomaly_alerts"
  ]
});

console.log(`Built marts layer: ${factOrders.length} fact rows and ${12} curated models.`);

function summarize(rows, field) {
  return groupBy(
    rows,
    (row) => row[field],
    (row) => ({ [field]: row[field], orders: 0, customers: new Set(), units: 0, revenue: 0, cost: 0, profit: 0, discount_rate: 0, fulfillment_days: 0 }),
    (acc, row) => {
      acc.orders += 1;
      acc.customers.add(row.customer_id);
      acc.units += row.units;
      acc.revenue += row.revenue;
      acc.cost += row.cost;
      acc.profit += row.profit;
      acc.discount_rate += row.discount_rate;
      acc.fulfillment_days += row.fulfillment_days;
    }
  ).map((row) => ({
    ...row,
    customers: row.customers.size,
    revenue: round(row.revenue),
    cost: round(row.cost),
    profit: round(row.profit),
    average_order_value: round(row.revenue / row.orders),
    margin_rate: round(row.profit / row.revenue, 4),
    avg_discount_rate: round(row.discount_rate / row.orders, 4),
    avg_fulfillment_days: round(row.fulfillment_days / row.orders, 2)
  }));
}

function buildCohortRetention(customerRows, orderRows) {
  const orderMonthsByCustomer = new Map();
  for (const order of orderRows) {
    if (!orderMonthsByCustomer.has(order.customer_id)) orderMonthsByCustomer.set(order.customer_id, new Set());
    orderMonthsByCustomer.get(order.customer_id).add(order.order_month);
  }

  const rows = [];
  const cohorts = groupBy(
    customerRows,
    (customer) => customer.signup_month,
    (customer) => ({ cohort_month: customer.signup_month, customers: [] }),
    (acc, customer) => acc.customers.push(customer)
  );

  for (const cohort of cohorts) {
    for (let monthNumber = 0; monthNumber <= 5; monthNumber += 1) {
      const activeCustomers = cohort.customers.filter((customer) => {
        const months = orderMonthsByCustomer.get(customer.customer_id) ?? new Set();
        return [...months].some((orderMonth) => monthDiff(cohort.cohort_month, orderMonth) === monthNumber);
      }).length;
      rows.push({
        cohort_month: cohort.cohort_month,
        month_number: monthNumber,
        cohort_size: cohort.customers.length,
        active_customers: activeCustomers,
        retention_rate: round(activeCustomers / cohort.customers.length, 4)
      });
    }
  }

  return rows.sort((a, b) => a.cohort_month.localeCompare(b.cohort_month) || a.month_number - b.month_number);
}

function buildForecast(monthlyRows) {
  const recent = monthlyRows.slice(-6);
  const { slope, intercept } = linearFit(recent.map((row) => row.revenue));
  const lastMonth = monthlyRows.at(-1).month;

  return Array.from({ length: 3 }, (_, index) => {
    const forecastMonth = addMonths(lastMonth, index + 1);
    const forecastRevenue = intercept + slope * (recent.length + index + 1);
    return {
      month: forecastMonth,
      forecast_revenue: round(forecastRevenue),
      method: "six_month_linear_trend",
      note: "Directional planning estimate, not a production forecast"
    };
  });
}

function buildForecastBacktest(monthlyRows) {
  const rows = [];
  for (let index = 6; index < monthlyRows.length; index += 1) {
    const trainingWindow = monthlyRows.slice(index - 6, index);
    const { slope, intercept } = linearFit(trainingWindow.map((row) => row.revenue));
    const actual = monthlyRows[index].revenue;
    const forecast = intercept + slope * (trainingWindow.length + 1);
    rows.push({
      month: monthlyRows[index].month,
      training_start_month: trainingWindow[0].month,
      training_end_month: trainingWindow.at(-1).month,
      actual_revenue: round(actual),
      forecast_revenue: round(forecast),
      forecast_error: round(actual - forecast),
      absolute_error: round(Math.abs(actual - forecast)),
      absolute_percentage_error: round(Math.abs(actual - forecast) / actual, 4),
      method: "six_month_linear_trend"
    });
  }
  return rows;
}

function summarizeForecastAccuracy(rows) {
  const mae = rows.reduce((total, row) => total + row.absolute_error, 0) / rows.length;
  const mape = rows.reduce((total, row) => total + row.absolute_percentage_error, 0) / rows.length;
  const bias = rows.reduce((total, row) => total + row.forecast_error, 0) / rows.length;
  return [
    {
      method: "six_month_linear_trend",
      backtest_months: rows.length,
      mean_absolute_error: round(mae),
      mean_absolute_percentage_error: round(mape, 4),
      average_forecast_bias: round(bias),
      note: "Backtest uses rolling six-month windows against known monthly revenue."
    }
  ];
}

function buildAnomalyAlerts(monthlyRows) {
  const metrics = [
    { field: "revenue", label: "Monthly revenue", direction: "two_sided", threshold: 1.6 },
    { field: "margin_rate", label: "Gross margin rate", direction: "two_sided", threshold: 1.8 },
    { field: "avg_discount_rate", label: "Average discount rate", direction: "high_only", threshold: 1.6 },
    { field: "avg_fulfillment_days", label: "Average fulfillment days", direction: "high_only", threshold: 1.6 }
  ];
  const rows = [];

  for (const metric of metrics) {
    for (let index = 6; index < monthlyRows.length; index += 1) {
      const baseline = monthlyRows.slice(index - 6, index).map((row) => row[metric.field]);
      const baselineAverage = baseline.reduce((total, value) => total + value, 0) / baseline.length;
      const standardDeviation = Math.sqrt(baseline.reduce((total, value) => total + (value - baselineAverage) ** 2, 0) / baseline.length);
      const currentValue = monthlyRows[index][metric.field];
      const zScore = standardDeviation === 0 ? 0 : (currentValue - baselineAverage) / standardDeviation;
      const isAnomaly = metric.direction === "high_only" ? zScore >= metric.threshold : Math.abs(zScore) >= metric.threshold;
      const severity = Math.abs(zScore) >= 2.5 ? "high" : isAnomaly ? "medium" : "normal";

      rows.push({
        month: monthlyRows[index].month,
        metric_name: metric.label,
        metric_field: metric.field,
        current_value: round(currentValue, 4),
        baseline_average: round(baselineAverage, 4),
        baseline_stddev: round(standardDeviation, 4),
        z_score: round(zScore, 4),
        threshold: metric.threshold,
        alert_flag: isAnomaly ? "alert" : "normal",
        severity,
        note: explainAnomaly(metric, currentValue, baselineAverage, zScore, isAnomaly)
      });
    }
  }

  return rows.sort((a, b) => a.month.localeCompare(b.month) || a.metric_name.localeCompare(b.metric_name));
}

function explainAnomaly(metric, currentValue, baselineAverage, zScore, isAnomaly) {
  if (!isAnomaly) {
    return "Within rolling six-month baseline range.";
  }
  const direction = currentValue > baselineAverage ? "above" : "below";
  return `${metric.label} is ${direction} its rolling six-month baseline with z-score ${round(zScore, 2)}.`;
}

function linearFit(values) {
  const xs = values.map((_, index) => index + 1);
  const xAvg = average(xs.map((value) => ({ value })), "value");
  const yAvg = average(values.map((value) => ({ value })), "value");
  const slope = xs.reduce((total, x, index) => total + (x - xAvg) * (values[index] - yAvg), 0) / xs.reduce((total, x) => total + (x - xAvg) ** 2, 0);
  const intercept = yAvg - slope * xAvg;
  return { slope, intercept };
}

function addMonths(month, offset) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 1 + offset, 1);
  return date.toISOString().slice(0, 7);
}

function min(values) {
  return values.length ? values.sort()[0] : "";
}

function max(values) {
  return values.length ? values.sort().at(-1) : "";
}

function without(row, field) {
  const clone = { ...row };
  delete clone[field];
  return clone;
}
