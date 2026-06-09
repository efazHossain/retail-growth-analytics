import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

type ErrorStateProps = {
  message: string;
};

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <Alert severity="error" variant="outlined">
      <AlertTitle>Dashboard data unavailable</AlertTitle>
      {message}
    </Alert>
  );
}
