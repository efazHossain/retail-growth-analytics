import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenueRow } from "../../services/dashboardApi";
import { compactCurrency, currency } from "../../utils/formatters";
import EmptyState from "../common/EmptyState";

type RevenueChartProps = {
  rows: RevenueRow[];
};

export default function RevenueChart({ rows }: RevenueChartProps) {
  const chartRows = [...rows].reverse();

  return (
    <Paper variant="outlined" sx={{ p: 3, height: 360 }}>
      <Stack spacing={2} sx={{ height: "100%" }}>
        <Stack>
          <Typography variant="h6" fontWeight={800}>
            Monthly Revenue Trend
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revenue progression across the loaded mart window.
          </Typography>
        </Stack>
        {chartRows.length === 0 ? (
          <EmptyState message="No revenue rows returned from the API." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartRows} margin={{ top: 10, right: 16, left: 6, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => compactCurrency.format(Number(value))} tick={{ fontSize: 12 }} width={70} />
              <Tooltip formatter={(value) => currency.format(Number(value))} />
              <Line type="monotone" dataKey="revenue" stroke="#1f6feb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Stack>
    </Paper>
  );
}
