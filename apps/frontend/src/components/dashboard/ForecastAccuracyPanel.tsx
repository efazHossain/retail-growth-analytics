import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ForecastData } from "../../services/dashboardApi";
import { currency, percent, signedCurrency } from "../../utils/formatters";
import EmptyState from "../common/EmptyState";

type ForecastAccuracyPanelProps = {
  forecast: ForecastData;
};

export default function ForecastAccuracyPanel({ forecast }: ForecastAccuracyPanelProps) {
  const accuracy = forecast.accuracy[0];

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack>
          <Typography variant="h6" fontWeight={800}>
            Forecast Accuracy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rolling six-month forecast backtest.
          </Typography>
        </Stack>
        {accuracy ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Stack>
              <Typography variant="body2" color="text.secondary">
                MAPE
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {percent.format(accuracy.mean_absolute_percentage_error)}
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="body2" color="text.secondary">
                MAE
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {currency.format(accuracy.mean_absolute_error)}
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="body2" color="text.secondary">
                Bias
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {signedCurrency(accuracy.average_forecast_bias)}
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Typography color="text.secondary">No forecast accuracy rows loaded.</Typography>
        )}
        {forecast.backtest.length === 0 ? (
          <EmptyState message="No forecast backtest rows returned from the API." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Actual</TableCell>
                  <TableCell align="right">Forecast</TableCell>
                  <TableCell align="right">APE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecast.backtest.slice(0, 6).map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell align="right">{currency.format(row.actual_revenue)}</TableCell>
                    <TableCell align="right">{currency.format(row.forecast_revenue)}</TableCell>
                    <TableCell align="right">{percent.format(row.absolute_percentage_error)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Paper>
  );
}
