import type { RequestHandler, Response } from "express";
import { Router } from "express";
import { env } from "../config/env.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";

export const analyticsRouter = Router();

type AnalyticsProxyRoute = {
  apiPath: string;
  analyticsPath: string;
  middleware: RequestHandler[];
};

const analyticsRoutes: AnalyticsProxyRoute[] = [
  { apiPath: "/api/analytics/health", analyticsPath: "/health", middleware: [] },
  { apiPath: "/api/analytics/business-summary", analyticsPath: "/analytics/business-summary", middleware: [requireAuth] },
  { apiPath: "/api/analytics/kpis", analyticsPath: "/analytics/kpis", middleware: [requireAuth] },
  {
    apiPath: "/api/analytics/forecast-accuracy",
    analyticsPath: "/analytics/forecast-accuracy",
    middleware: [requireAuth, requireRoles("analyst")]
  },
  { apiPath: "/api/analytics/anomalies", analyticsPath: "/analytics/anomalies", middleware: [requireAuth, requireRoles("analyst")] },
  { apiPath: "/api/analytics/trends", analyticsPath: "/analytics/trends", middleware: [requireAuth, requireRoles("analyst")] }
];

async function proxyAnalytics(path: string, response: Response) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const analyticsResponse = await fetch(`${env.ANALYTICS_SERVICE_URL}${path}`, {
      signal: controller.signal
    });

    if (!analyticsResponse.ok) {
      response.status(502).json({
        status: "error",
        message: "Analytics service returned an error.",
        analyticsStatus: analyticsResponse.status
      });
      return;
    }

    response.json(await analyticsResponse.json());
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "Analytics service request timed out."
      : "Analytics service is not reachable.";

    response.status(502).json({
      status: "error",
      message,
      analyticsServiceUrl: env.ANALYTICS_SERVICE_URL
    });
  } finally {
    clearTimeout(timeout);
  }
}

for (const route of analyticsRoutes) {
  analyticsRouter.get(route.apiPath, ...route.middleware, async (_request, response) => {
    const analyticsPath = route.analyticsPath;
    await proxyAnalytics(analyticsPath, response);
  });
}
