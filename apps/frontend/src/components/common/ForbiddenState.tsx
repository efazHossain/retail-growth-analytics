import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type ForbiddenStateProps = {
  title?: string;
  message: string;
};

export default function ForbiddenState({ title = "Access restricted", message }: ForbiddenStateProps) {
  return (
    <Paper variant="outlined" sx={{ p: 4 }}>
      <Stack spacing={1.5} alignItems="flex-start">
        <LockOutlinedIcon color="primary" />
        <Typography variant="h5" fontWeight={800}>
          {title}
        </Typography>
        <Typography color="text.secondary">{message}</Typography>
      </Stack>
    </Paper>
  );
}
