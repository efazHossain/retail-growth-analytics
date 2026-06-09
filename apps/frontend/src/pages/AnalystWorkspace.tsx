import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import AnalystKpiSummary from "../components/analyst/AnalystKpiSummary";
import CategoryDrilldown from "../components/analyst/CategoryDrilldown";
import ChannelDrilldown from "../components/analyst/ChannelDrilldown";
import FilterBar from "../components/analyst/FilterBar";
import ForecastDrilldown from "../components/analyst/ForecastDrilldown";
import RegionalDrilldown from "../components/analyst/RegionalDrilldown";
import AnomalyAlertsPanel from "../components/dashboard/AnomalyAlertsPanel";
import ChannelPerformanceChart from "../components/dashboard/ChannelPerformanceChart";
import CohortRetentionSummary from "../components/dashboard/CohortRetentionSummary";
import RevenueChart from "../components/dashboard/RevenueChart";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import { apiBaseUrl, getAnalystWorkspaceData, type AnalystFilters, type AnalystWorkspaceData } from "../services/dashboardApi";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: AnalystWorkspaceData };

const emptyFilters: AnalystFilters = {};

export default function AnalystWorkspace() {
  const [filters, setFilters] = useState<AnalystFilters>(emptyFilters);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setState((current) => {
      if (current.status === "success") {
        setIsRefreshing(true);
        return current;
      }
      return { status: "loading" };
    });

    getAnalystWorkspaceData(filters)
      .then((data) => {
        if (isMounted) {
          setState({ status: "success", data });
          setIsRefreshing(false);
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : "Unexpected analyst workspace data error";
        setState({ status: "error", message });
        setIsRefreshing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const options =
    state.status === "success"
      ? state.data.options
      : {
          months: [],
          regions: [],
          channels: [],
          categories: []
        };

  return (
    <Stack spacing={3.5}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
        <Stack spacing={0.75}>
          <Typography variant="overline" color="primary" fontWeight={800}>
            Interactive mart exploration
          </Typography>
          <Typography variant="h3" fontWeight={900}>
            Analyst Workspace
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 780 }}>
            Explore the Postgres-backed retail marts with compatible month, region, channel, and category filters.
          </Typography>
        </Stack>
        <Alert severity="info" variant="outlined" sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}>
          API: {apiBaseUrl}
        </Alert>
      </Stack>

      <FilterBar filters={filters} options={options} onChange={setFilters} onReset={() => setFilters({})} />
      {isRefreshing ? <LinearProgress /> : null}

      {state.status === "loading" ? <LoadingState /> : null}
      {state.status === "error" ? <ErrorState message={state.message} /> : null}

      {state.status === "success" ? (
        <Stack spacing={3}>
          <AnalystKpiSummary
            revenue={state.data.revenue}
            categories={state.data.categories}
            regions={state.data.regions}
            channels={state.data.channels}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} lg={8}>
              <RevenueChart rows={state.data.revenue} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <CohortRetentionSummary rows={state.data.cohorts} />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
              <CategoryDrilldown rows={state.data.categories} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <RegionalDrilldown rows={state.data.regions} />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
              <ChannelDrilldown rows={state.data.channels} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <ChannelPerformanceChart rows={state.data.channels} />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={7}>
              <ForecastDrilldown forecast={state.data.forecast} />
            </Grid>
            <Grid item xs={12} lg={5}>
              <AnomalyAlertsPanel rows={state.data.anomalies} />
            </Grid>
          </Grid>
        </Stack>
      ) : null}
    </Stack>
  );
}
