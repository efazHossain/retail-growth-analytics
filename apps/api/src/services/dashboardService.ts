import { query } from "../db/pool.js";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export type DashboardFilters = {
  [key: string]: unknown;
};

type QueryParts = {
  where: string[];
  params: unknown[];
};

function single(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
}

function textParam(value: unknown) {
  const candidate = single(value)?.trim();
  return candidate ? candidate : undefined;
}

function limitParam(value: unknown, fallback = DEFAULT_LIMIT) {
  const parsed = Number.parseInt(single(value) ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, MAX_LIMIT);
}

function addEqualsFilter(parts: QueryParts, column: string, value: string | undefined) {
  if (!value) return;
  parts.params.push(value);
  parts.where.push(`${column} = $${parts.params.length}`);
}

function whereClause(parts: QueryParts) {
  return parts.where.length ? `where ${parts.where.join(" and ")}` : "";
}

export async function getRevenue(filters: DashboardFilters) {
  const parts: QueryParts = { where: [], params: [] };
  addEqualsFilter(parts, "month", textParam(filters.month));
  const limit = limitParam(filters.limit);
  parts.params.push(limit);

  return query(
    `
      select month, orders, customers, units,
        revenue::float as revenue,
        cost::float as cost,
        profit::float as profit,
        average_order_value::float as average_order_value,
        margin_rate::float as margin_rate,
        avg_discount_rate::float as avg_discount_rate,
        avg_fulfillment_days::float as avg_fulfillment_days
      from retail.mart_monthly_revenue
      ${whereClause(parts)}
      order by month desc
      limit $${parts.params.length}
    `,
    parts.params
  );
}

export async function getCategories(filters: DashboardFilters) {
  const parts: QueryParts = { where: [], params: [] };
  addEqualsFilter(parts, "category", textParam(filters.category));
  const limit = limitParam(filters.limit, 10);
  parts.params.push(limit);

  return query(
    `
      select category, orders, customers, units,
        revenue::float as revenue,
        cost::float as cost,
        profit::float as profit,
        average_order_value::float as average_order_value,
        margin_rate::float as margin_rate,
        avg_discount_rate::float as avg_discount_rate,
        avg_fulfillment_days::float as avg_fulfillment_days
      from retail.mart_category_performance
      ${whereClause(parts)}
      order by revenue desc
      limit $${parts.params.length}
    `,
    parts.params
  );
}

export async function getRegions(filters: DashboardFilters) {
  const parts: QueryParts = { where: [], params: [] };
  addEqualsFilter(parts, "region", textParam(filters.region));
  const limit = limitParam(filters.limit, 10);
  parts.params.push(limit);

  return query(
    `
      select region, orders, customers, units,
        revenue::float as revenue,
        cost::float as cost,
        profit::float as profit,
        average_order_value::float as average_order_value,
        margin_rate::float as margin_rate,
        avg_discount_rate::float as avg_discount_rate,
        avg_fulfillment_days::float as avg_fulfillment_days
      from retail.mart_regional_margin
      ${whereClause(parts)}
      order by margin_rate asc
      limit $${parts.params.length}
    `,
    parts.params
  );
}

export async function getChannels(filters: DashboardFilters) {
  const parts: QueryParts = { where: [], params: [] };
  addEqualsFilter(parts, "channel", textParam(filters.channel));
  const limit = limitParam(filters.limit, 10);
  parts.params.push(limit);

  return query(
    `
      select channel, orders, customers, units,
        revenue::float as revenue,
        cost::float as cost,
        profit::float as profit,
        average_order_value::float as average_order_value,
        margin_rate::float as margin_rate,
        avg_discount_rate::float as avg_discount_rate,
        avg_fulfillment_days::float as avg_fulfillment_days
      from retail.mart_channel_performance
      ${whereClause(parts)}
      order by revenue desc
      limit $${parts.params.length}
    `,
    parts.params
  );
}

export async function getCohorts(filters: DashboardFilters) {
  const parts: QueryParts = { where: [], params: [] };
  addEqualsFilter(parts, "cohort_month", textParam(filters.month));
  const limit = limitParam(filters.limit, 36);
  parts.params.push(limit);

  return query(
    `
      select cohort_month, month_number, cohort_size, active_customers,
        retention_rate::float as retention_rate
      from retail.mart_cohort_retention
      ${whereClause(parts)}
      order by cohort_month desc, month_number asc
      limit $${parts.params.length}
    `,
    parts.params
  );
}

export async function getForecast(filters: DashboardFilters) {
  const parts: QueryParts = { where: [], params: [] };
  addEqualsFilter(parts, "month", textParam(filters.month));
  const limit = limitParam(filters.limit, 12);
  parts.params.push(limit);

  const [accuracy, backtest] = await Promise.all([
    query(`
      select method, backtest_months,
        mean_absolute_error::float as mean_absolute_error,
        mean_absolute_percentage_error::float as mean_absolute_percentage_error,
        average_forecast_bias::float as average_forecast_bias,
        note
      from retail.mart_forecast_accuracy
      order by method
    `),
    query(
      `
        select month, training_start_month, training_end_month,
          actual_revenue::float as actual_revenue,
          forecast_revenue::float as forecast_revenue,
          forecast_error::float as forecast_error,
          absolute_error::float as absolute_error,
          absolute_percentage_error::float as absolute_percentage_error,
          method
        from retail.mart_forecast_backtest
        ${whereClause(parts)}
        order by month desc
        limit $${parts.params.length}
      `,
      parts.params
    )
  ]);

  return { accuracy, backtest };
}

export async function getAnomalies(filters: DashboardFilters) {
  const parts: QueryParts = { where: [], params: [] };
  addEqualsFilter(parts, "month", textParam(filters.month));
  addEqualsFilter(parts, "severity", textParam(filters.severity));
  const limit = limitParam(filters.limit, 20);
  parts.params.push(limit);

  return query(
    `
      select month, metric_name, metric_field,
        current_value::float as current_value,
        baseline_average::float as baseline_average,
        baseline_stddev::float as baseline_stddev,
        z_score::float as z_score,
        threshold::float as threshold,
        alert_flag, severity, note
      from retail.mart_anomaly_alerts
      ${whereClause(parts)}
      order by month desc, metric_name asc
      limit $${parts.params.length}
    `,
    parts.params
  );
}

export async function getSummary() {
  const [totals] = await query<{
    revenue: number;
    profit: number;
    orders: number;
    customers: number;
    average_order_value: number;
    gross_margin_rate: number;
  }>(`
    select
      coalesce(sum(revenue), 0)::float as revenue,
      coalesce(sum(profit), 0)::float as profit,
      coalesce(sum(orders), 0)::int as orders,
      coalesce(max(customers), 0)::int as customers,
      coalesce(sum(revenue) / nullif(sum(orders), 0), 0)::float as average_order_value,
      coalesce(sum(profit) / nullif(sum(revenue), 0), 0)::float as gross_margin_rate
    from retail.mart_monthly_revenue
  `);

  const [categories, regions, channels, cohorts, forecast, anomalies, revenue] = await Promise.all([
    getCategories({ limit: "5" }),
    getRegions({ limit: "5" }),
    getChannels({ limit: "5" }),
    getCohorts({ limit: "12" }),
    getForecast({ limit: "6" }),
    getAnomalies({ limit: "10" }),
    getRevenue({ limit: "12" })
  ]);

  return {
    kpis: totals ?? {},
    revenue,
    categories,
    regions,
    channels,
    cohorts,
    forecast,
    anomalies
  };
}

export function envelope(data: unknown, count?: number) {
  return {
    status: "ok",
    meta: typeof count === "number" ? { count } : undefined,
    data
  };
}
