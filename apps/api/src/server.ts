import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { analyticsRouter } from "./routes/analytics.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { healthRouter } from "./routes/health.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(healthRouter);
app.use(dashboardRouter);
app.use(analyticsRouter);
app.use(errorHandler);

app.listen(env.API_PORT, () => {
  console.log(
    JSON.stringify({
      level: "info",
      message: "API listening",
      port: env.API_PORT
    })
  );
});
