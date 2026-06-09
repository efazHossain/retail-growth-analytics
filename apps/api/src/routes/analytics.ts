import { Router } from "express";
import { env } from "../config/env.js";

export const analyticsRouter = Router();

analyticsRouter.get("/api/analytics/health", async (_request, response, next) => {
  try {
    const analyticsResponse = await fetch(`${env.ANALYTICS_SERVICE_URL}/health`);

    if (!analyticsResponse.ok) {
      response.status(502).json({
        status: "degraded",
        analyticsStatus: analyticsResponse.status
      });
      return;
    }

    response.json(await analyticsResponse.json());
  } catch (error) {
    // Phase 1 keeps this route useful even when the analytics container is not running.
    response.status(200).json({
      status: "placeholder",
      message: "Analytics service is not reachable yet. Start Docker Compose to enable proxy health checks.",
      analyticsServiceUrl: env.ANALYTICS_SERVICE_URL
    });
  }
});
