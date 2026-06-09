import { useState, type FormEvent } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useAuth } from "../services/authContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("executive");
  const [password, setPassword] = useState("ExecutiveDemo123!");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(username, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", px: 2 }}>
      <Paper variant="outlined" sx={{ width: "100%", maxWidth: 440, p: 4 }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <LockOutlinedIcon color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight={900}>
              Retail Intelligence
            </Typography>
            <Typography color="text.secondary">
              Sign in with a demo role to view protected dashboard data.
            </Typography>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? "Signing in" : "Sign in"}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Demo users: admin, analyst, executive.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
