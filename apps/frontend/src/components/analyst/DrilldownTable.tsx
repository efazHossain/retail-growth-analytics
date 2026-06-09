import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EmptyState from "../common/EmptyState";

export type DrilldownColumn<T> = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render: (row: T) => string;
};

type DrilldownTableProps<T> = {
  title: string;
  description: string;
  rows: T[];
  columns: DrilldownColumn<T>[];
  getRowKey: (row: T) => string;
  emptyMessage: string;
};

export default function DrilldownTable<T>({ title, description, rows, columns, getRowKey, emptyMessage }: DrilldownTableProps<T>) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack>
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
        {rows.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align ?? "left"}>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={getRowKey(row)}>
                    {columns.map((column) => (
                      <TableCell key={column.key} align={column.align ?? "left"}>
                        {column.render(row)}
                      </TableCell>
                    ))}
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
