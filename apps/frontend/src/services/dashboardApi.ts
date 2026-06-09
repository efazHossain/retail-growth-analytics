const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export type ApiEnvelope<T> = {
  status: string;
  meta?: { count?: number };
  data: T;
};

export type Kpis = {
  revenue: number;
  profit: number;
  orders: number;
  customers: number;
  average_order_value: number;
  gross_margin_rate: number;
};

export type PerformanceRow = {
  orders: number;
  customers: number;
  units: number;
  revenue: number;
  cost: number;
  profit: number;
  average_order_value: number;
  margin_rate: number;
  avg_discount_rate: number;
  avg_fulfillment_days: number;
};

export type RevenueRow = PerformanceRow & {
  month: string;
};

export type CategoryRow = PerformanceRow & {
  category: string;
};

export type RegionRow = PerformanceRow & {
  region: string;
};

export type ChannelRow = PerformanceRow & {
  channel: string;
};

export type CohortRow = {
  cohort_month: string;
  month_number: number;
  cohort_size: number;
  active_customers: number;
  retention_rate: number;
};

export type ForecastAccuracyRow = {
  method: string;
  backtest_months: number;
  mean_absolute_error: number;
  mean_absolute_percentage_error: number;
  average_forecast_bias: number;
  note: string;
};

export type ForecastBacktestRow = {
  month: string;
  training_start_month: string;
  training_end_month: string;
  actual_revenue: number;
  forecast_revenue: number;
  forecast_error: number;
  absolute_error: number;
  absolute_percentage_error: number;
  method: string;
};

export type ForecastData = {
  accuracy: ForecastAccuracyRow[];
  backtest: ForecastBacktestRow[];
};

export type AnomalyRow = {
  month: string;
  metric_name: string;
  metric_field: string;
  current_value: number;
  baseline_average: number;
  baseline_stddev: number;
  z_score: number;
  threshold: number;
  alert_flag: "alert" | "normal";
  severity: "high" | "medium" | "normal";
  note: string;
};

export type DashboardSummary = {
  kpis: Kpis;
  revenue: RevenueRow[];
  categories: CategoryRow[];
  regions: RegionRow[];
  channels: ChannelRow[];
  cohorts: CohortRow[];
  forecast: ForecastData;
  anomalies: AnomalyRow[];
};

export type ExecutiveDashboardData = {
  summary: DashboardSummary;
  revenue: RevenueRow[];
  categories: CategoryRow[];
  regions: RegionRow[];
  channels: ChannelRow[];
  cohorts: CohortRow[];
  forecast: ForecastData;
  anomalies: AnomalyRow[];
};

export type AnalystFilters = {
  month?: string;
  region?: string;
  channel?: string;
  category?: string;
};

export type FilterOptions = {
  months: string[];
  regions: string[];
  channels: string[];
  categories: string[];
};

export type AnalystWorkspaceData = {
  filters: AnalystFilters;
  options: FilterOptions;
  revenue: RevenueRow[];
  categories: CategoryRow[];
  regions: RegionRow[];
  channels: ChannelRow[];
  cohorts: CohortRow[];
  forecast: ForecastData;
  anomalies: AnomalyRow[];
};

async function request<T>(path: string): Promise<T> {
  const url = `${apiBaseUrl}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (payload.status !== "ok") {
    throw new Error(`API returned unexpected status for ${url}`);
  }

  return payload.data;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getExecutiveDashboardData(): Promise<ExecutiveDashboardData> {
  const [summary, revenue, categories, regions, channels, cohorts, forecast, anomalies] = await Promise.all([
    request<DashboardSummary>("/api/dashboard/summary"),
    request<RevenueRow[]>("/api/dashboard/revenue?limit=18"),
    request<CategoryRow[]>("/api/dashboard/categories?limit=10"),
    request<RegionRow[]>("/api/dashboard/regions?limit=10"),
    request<ChannelRow[]>("/api/dashboard/channels?limit=10"),
    request<CohortRow[]>("/api/dashboard/cohorts?limit=36"),
    request<ForecastData>("/api/dashboard/forecast?limit=12"),
    request<AnomalyRow[]>("/api/dashboard/anomalies?limit=12")
  ]);

  return {
    summary,
    revenue: revenue ?? [],
    categories: categories ?? [],
    regions: regions ?? [],
    channels: channels ?? [],
    cohorts: cohorts ?? [],
    forecast: forecast ?? { accuracy: [], backtest: [] },
    anomalies: anomalies ?? []
  };
}

export async function getAnalystWorkspaceData(filters: AnalystFilters): Promise<AnalystWorkspaceData> {
  const [revenueOptions, categoryOptions, regionOptions, channelOptions] = await Promise.all([
    request<RevenueRow[]>("/api/dashboard/revenue?limit=100"),
    request<CategoryRow[]>("/api/dashboard/categories?limit=100"),
    request<RegionRow[]>("/api/dashboard/regions?limit=100"),
    request<ChannelRow[]>("/api/dashboard/channels?limit=100")
  ]);

  const [revenue, categories, regions, channels, cohorts, forecast, anomalies] = await Promise.all([
    request<RevenueRow[]>(`/api/dashboard/revenue${buildQuery({ month: filters.month, limit: 18 })}`),
    request<CategoryRow[]>(`/api/dashboard/categories${buildQuery({ category: filters.category, limit: 20 })}`),
    request<RegionRow[]>(`/api/dashboard/regions${buildQuery({ region: filters.region, limit: 20 })}`),
    request<ChannelRow[]>(`/api/dashboard/channels${buildQuery({ channel: filters.channel, limit: 20 })}`),
    request<CohortRow[]>(`/api/dashboard/cohorts${buildQuery({ month: filters.month, limit: 36 })}`),
    request<ForecastData>(`/api/dashboard/forecast${buildQuery({ month: filters.month, limit: 12 })}`),
    request<AnomalyRow[]>(`/api/dashboard/anomalies${buildQuery({ month: filters.month, limit: 24 })}`)
  ]);

  return {
    filters,
    options: {
      months: revenueOptions.map((row) => row.month),
      regions: regionOptions.map((row) => row.region),
      channels: channelOptions.map((row) => row.channel),
      categories: categoryOptions.map((row) => row.category)
    },
    revenue: revenue ?? [],
    categories: categories ?? [],
    regions: regions ?? [],
    channels: channels ?? [],
    cohorts: cohorts ?? [],
    forecast: forecast ?? { accuracy: [], backtest: [] },
    anomalies: anomalies ?? []
  };
}

export { apiBaseUrl };
