import { useEffect, useState } from "react";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AnalystWorkspace from "./pages/AnalystWorkspace";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import LoginPage from "./pages/LoginPage";
import ForbiddenState from "./components/common/ForbiddenState";
import LoadingState from "./components/common/LoadingState";
import { useAuth } from "./services/authContext";

type View = "executive" | "analyst";

function canUseAnalystWorkspace(role: string | undefined) {
  return role === "admin" || role === "analyst";
}

export default function App() {
  const { user, isLoading, logout } = useAuth();
  const [view, setView] = useState<View>("executive");
  const canViewAnalyst = canUseAnalystWorkspace(user?.role);

  useEffect(() => {
    if (!canViewAnalyst && view === "analyst") setView("executive");
  }, [canViewAnalyst, view]);

  if (isLoading) return <LoadingState />;
  if (!user) return <LoginPage />;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar sx={{ gap: 2, borderBottom: 1, borderColor: "divider" }}>
          <InsightsOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Retail Intelligence Platform
          </Typography>
          <Stack spacing={0} sx={{ display: { xs: "none", md: "flex" }, textAlign: "right" }}>
            <Typography variant="body2" fontWeight={700}>
              {user.displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.role}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<DashboardOutlinedIcon />}
              variant={view === "executive" ? "contained" : "text"}
              onClick={() => setView("executive")}
            >
              Executive
            </Button>
            {canViewAnalyst ? (
              <Button
                startIcon={<AnalyticsOutlinedIcon />}
                variant={view === "analyst" ? "contained" : "text"}
                onClick={() => setView("analyst")}
              >
                Analyst
              </Button>
            ) : null}
            <Button onClick={logout}>Logout</Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {view === "executive" ? <ExecutiveDashboard /> : null}
        {view === "analyst" && canViewAnalyst ? <AnalystWorkspace /> : null}
        {view === "analyst" && !canViewAnalyst ? (
          <ForbiddenState message="Your role can view the executive dashboard, but the Analyst Workspace requires an analyst or admin role." />
        ) : null}
      </Container>
    </Box>
  );
}
