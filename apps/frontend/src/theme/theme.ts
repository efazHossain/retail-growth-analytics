import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1f6feb"
    },
    secondary: {
      main: "#0f766e"
    },
    background: {
      default: "#f7f9fc"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: ["Inter", "Segoe UI", "Arial", "sans-serif"].join(",")
  }
});
