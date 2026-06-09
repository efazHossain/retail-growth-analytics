import Chip from "@mui/material/Chip";
import type { ChipProps } from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { AnomalyRow } from "../../services/dashboardApi";

type AnomalyAlertsPanelProps = {
  rows: AnomalyRow[];
};

function colorForSeverity(severity: AnomalyRow["severity"]): ChipProps["color"] {
  if (severity === "high") return "error";
  if (severity === "medium") return "warning";
  return "default";
}

export default function AnomalyAlertsPanel({ rows }: AnomalyAlertsPanelProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
      <Stack spacing={2}>
        <Stack>
          <Typography variant="h6" fontWeight={800}>
            Anomaly Alerts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Most recent anomaly-monitoring rows from the mart.
          </Typography>
        </Stack>
        {rows.length === 0 ? (
          <Typography color="text.secondary">No anomaly rows returned.</Typography>
        ) : (
          <List disablePadding>
            {rows.slice(0, 6).map((row) => (
              <ListItem
                key={`${row.month}-${row.metric_field}`}
                disableGutters
                secondaryAction={<Chip size="small" label={row.severity} color={colorForSeverity(row.severity)} />}
              >
                <ListItemText primary={`${row.month} - ${row.metric_name}`} secondary={row.note} />
              </ListItem>
            ))}
          </List>
        )}
      </Stack>
    </Paper>
  );
}
