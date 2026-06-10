import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { analyticsRouter } from "./routes/analytics.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { healthRouter } from "./routes/health.js";
import { insightsRouter } from "./routes/insights.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

const app = express();
const corsOrigin = env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(requestLogger);
app.use(express.json());
app.use(healthRouter);
app.use(authRouter);
app.use(dashboardRouter);
app.use(analyticsRouter);
app.use(insightsRouter);
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
