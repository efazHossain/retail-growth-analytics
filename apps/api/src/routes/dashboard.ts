import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateQuery } from "../middleware/validate.js";
import {
  envelope,
  getAnomalies,
  getCategories,
  getChannels,
  getCohorts,
  getForecast,
  getRegions,
  getRevenue,
  getSummary
} from "../services/dashboardService.js";

export const dashboardRouter = Router();

const month = z.string().regex(/^\d{4}-\d{2}$/, "month must use YYYY-MM format");
const safeText = z.string().trim().min(1).max(80);
const limit = z.string().regex(/^\d+$/, "limit must be a positive integer").optional();
const monthQuery = z.object({ month: month.optional(), limit }).strict();
const categoryQuery = z.object({ category: safeText.optional(), limit }).strict();
const regionQuery = z.object({ region: safeText.optional(), limit }).strict();
const channelQuery = z.object({ channel: safeText.optional(), limit }).strict();
const anomaliesQuery = z.object({
  month: month.optional(),
  severity: z.enum(["normal", "medium", "high"]).optional(),
  limit
}).strict();

dashboardRouter.get(
  "/api/dashboard/summary",
  requireAuth,
  asyncHandler(async (_request, response) => {
    response.json(envelope(await getSummary()));
  })
);

dashboardRouter.get(
  "/api/dashboard/revenue",
  requireAuth,
  validateQuery(monthQuery),
  asyncHandler(async (request, response) => {
    const data = await getRevenue(request.query);
    response.json(envelope(data, data.length));
  })
);

dashboardRouter.get(
  "/api/dashboard/categories",
  requireAuth,
  validateQuery(categoryQuery),
  asyncHandler(async (request, response) => {
    const data = await getCategories(request.query);
    response.json(envelope(data, data.length));
  })
);

dashboardRouter.get(
  "/api/dashboard/regions",
  requireAuth,
  validateQuery(regionQuery),
  asyncHandler(async (request, response) => {
    const data = await getRegions(request.query);
    response.json(envelope(data, data.length));
  })
);

dashboardRouter.get(
  "/api/dashboard/channels",
  requireAuth,
  validateQuery(channelQuery),
  asyncHandler(async (request, response) => {
    const data = await getChannels(request.query);
    response.json(envelope(data, data.length));
  })
);

dashboardRouter.get(
  "/api/dashboard/cohorts",
  requireAuth,
  requireRoles("analyst", "executive"),
  validateQuery(monthQuery),
  asyncHandler(async (request, response) => {
    const data = await getCohorts(request.query);
    response.json(envelope(data, data.length));
  })
);

dashboardRouter.get(
  "/api/dashboard/forecast",
  requireAuth,
  validateQuery(monthQuery),
  asyncHandler(async (request, response) => {
    response.json(envelope(await getForecast(request.query)));
  })
);

dashboardRouter.get(
  "/api/dashboard/anomalies",
  requireAuth,
  validateQuery(anomaliesQuery),
  asyncHandler(async (request, response) => {
    const data = await getAnomalies(request.query);
    response.json(envelope(data, data.length));
  })
);
