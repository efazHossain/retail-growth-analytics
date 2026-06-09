import { useEffect, useState } from "react";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AnomalyAlertsPanel from "../components/dashboard/AnomalyAlertsPanel";
import CategoryPerformanceTable from "../components/dashboard/CategoryPerformanceTable";
import ChannelPerformanceChart from "../components/dashboard/ChannelPerformanceChart";
import CohortRetentionSummary from "../components/dashboard/CohortRetentionSummary";
import ForecastAccuracyPanel from "../components/dashboard/ForecastAccuracyPanel";
import KpiCard from "../components/dashboard/KpiCard";
import RegionalMarginTable from "../components/dashboard/RegionalMarginTable";
import RevenueChart from "../components/dashboard/RevenueChart";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import { apiBaseUrl, getExecutiveDashboardData, type ExecutiveDashboardData } from "../services/dashboardApi";
import { currency, number, percent } from "../utils/formatters";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: ExecutiveDashboardData };

export default function ExecutiveDashboard() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    getExecutiveDashboardData()
      .then((data) => {
        if (isMounted) setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : "Unexpected dashboard data error";
        setState({ status: "error", message });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} />;

  const { summary, revenue, categories, regions, channels, cohorts, forecast, anomalies } = state.data;
  const kpis = summary.kpis ?? {
    revenue: 0,
    profit: 0,
    orders: 0,
    customers: 0,
    average_order_value: 0,
    gross_margin_rate: 0
  };
  const latestMonth = revenue[0]?.month ?? "n/a";
  const latestRevenue = revenue[0]?.revenue ?? 0;

  return (
    <Stack spacing={3.5}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
        <Stack spacing={0.75}>
          <Typography variant="overline" color="primary" fontWeight={800}>
            Executive command center
          </Typography>
          <Typography variant="h3" fontWeight={900}>
            Retail Intelligence Platform
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
            Postgres-backed revenue, margin, retention, forecast, and anomaly views generated from the existing mart layer.
          </Typography>
        </Stack>
        <Alert severity="info" variant="outlined" sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}>
          API: {apiBaseUrl}
        </Alert>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Total revenue"
            value={currency.format(kpis.revenue)}
            helper={`${latestMonth}: ${currency.format(latestRevenue)}`}
            icon={<AttachMoneyOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Gross margin"
            value={percent.format(kpis.gross_margin_rate)}
            helper={`${currency.format(kpis.profit)} total profit`}
            icon={<TrendingUpOutlinedIcon color="secondary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Orders"
            value={number.format(kpis.orders)}
            helper={`${currency.format(kpis.average_order_value)} average order value`}
            icon={<ReceiptLongOutlinedIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Customers"
            value={number.format(kpis.customers)}
            helper={`${number.format(categories.length)} categories monitored`}
            icon={<Inventory2OutlinedIcon color="secondary" />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <RevenueChart rows={revenue} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <AnomalyAlertsPanel rows={anomalies} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <CategoryPerformanceTable rows={categories} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <RegionalMarginTable rows={regions} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <ChannelPerformanceChart rows={channels} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <CohortRetentionSummary rows={cohorts} />
        </Grid>
      </Grid>

      <ForecastAccuracyPanel forecast={forecast} />
    </Stack>
  );
}
