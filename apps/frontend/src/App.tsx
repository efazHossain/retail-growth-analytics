import { useState } from "react";
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

type View = "executive" | "analyst";

export default function App() {
  const [view, setView] = useState<View>("executive");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar sx={{ gap: 2, borderBottom: 1, borderColor: "divider" }}>
          <InsightsOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Retail Intelligence Platform
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<DashboardOutlinedIcon />}
              variant={view === "executive" ? "contained" : "text"}
              onClick={() => setView("executive")}
            >
              Executive
            </Button>
            <Button
              startIcon={<AnalyticsOutlinedIcon />}
              variant={view === "analyst" ? "contained" : "text"}
              onClick={() => setView("analyst")}
            >
              Analyst
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {view === "executive" ? <ExecutiveDashboard /> : <AnalystWorkspace />}
      </Container>
    </Box>
  );
}
