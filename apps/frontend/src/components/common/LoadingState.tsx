import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function LoadingState() {
  return (
    <Paper variant="outlined" sx={{ p: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress size={24} />
        <Typography color="text.secondary">Loading executive dashboard data...</Typography>
      </Stack>
    </Paper>
  );
}
