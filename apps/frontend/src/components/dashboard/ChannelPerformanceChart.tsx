import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChannelRow } from "../../services/dashboardApi";
import { compactCurrency, currency } from "../../utils/formatters";
import EmptyState from "../common/EmptyState";

type ChannelPerformanceChartProps = {
  rows: ChannelRow[];
};

export default function ChannelPerformanceChart({ rows }: ChannelPerformanceChartProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, height: 340 }}>
      <Stack spacing={2} sx={{ height: "100%" }}>
        <Stack>
          <Typography variant="h6" fontWeight={800}>
            Channel Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revenue by commercial channel.
          </Typography>
        </Stack>
        {rows.length === 0 ? (
          <EmptyState message="No channel rows returned from the API." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => compactCurrency.format(Number(value))} tick={{ fontSize: 12 }} width={70} />
              <Tooltip formatter={(value) => currency.format(Number(value))} />
              <Bar dataKey="revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Stack>
    </Paper>
  );
}
