import Typography from "@mui/material/Typography";

type EmptyStateProps = {
  message: string;
};

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <Typography color="text.secondary" sx={{ py: 3 }}>
      {message}
    </Typography>
  );
}
