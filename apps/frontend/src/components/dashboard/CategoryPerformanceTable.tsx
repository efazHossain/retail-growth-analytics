import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import type { CategoryRow } from "../../services/dashboardApi";
import { currency, percent } from "../../utils/formatters";
import EmptyState from "../common/EmptyState";

type CategoryPerformanceTableProps = {
  rows: CategoryRow[];
};

export default function CategoryPerformanceTable({ rows }: CategoryPerformanceTableProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack>
          <Typography variant="h6" fontWeight={800}>
            Top Category Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revenue-ranked category contribution and margin.
          </Typography>
        </Stack>
        {rows.length === 0 ? (
          <EmptyState message="No category rows returned from the API." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Profit</TableCell>
                  <TableCell align="right">Margin</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.category}>
                    <TableCell>{row.category}</TableCell>
                    <TableCell align="right">{currency.format(row.revenue)}</TableCell>
                    <TableCell align="right">{currency.format(row.profit)}</TableCell>
                    <TableCell align="right">{percent.format(row.margin_rate)}</TableCell>
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
