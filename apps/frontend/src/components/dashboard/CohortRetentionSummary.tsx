import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { CohortRow } from "../../services/dashboardApi";
import { percent } from "../../utils/formatters";

type CohortRetentionSummaryProps = {
  rows: CohortRow[];
};

export default function CohortRetentionSummary({ rows }: CohortRetentionSummaryProps) {
  const latestCohort = rows[0]?.cohort_month ?? "n/a";
  const monthFive = rows.find((row) => row.cohort_month === latestCohort && row.month_number === 5);
  const averageRetention =
    rows.length > 0 ? rows.reduce((total, row) => total + row.retention_rate, 0) / rows.length : 0;

  return (
    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
      <Stack spacing={2}>
        <Stack>
          <Typography variant="h6" fontWeight={800}>
            Cohort Retention
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Latest loaded cohorts from the retention mart.
          </Typography>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <Stack>
            <Typography variant="body2" color="text.secondary">
              Latest cohort
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {latestCohort}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="body2" color="text.secondary">
              Month 5 retention
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {monthFive ? percent.format(monthFive.retention_rate) : "n/a"}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="body2" color="text.secondary">
              Average shown
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {percent.format(averageRetention)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
