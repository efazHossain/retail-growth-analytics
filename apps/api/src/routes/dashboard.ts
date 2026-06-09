import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
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

dashboardRouter.get(
  "/api/dashboard/summary",
  asyncHandler(async (_request, response) => {
    response.json(envelope(await getSummary()));
  })
);

dashboardRouter.get(
  "/api/dashboard/revenue",
  asyncHandler(async (request, response) => {
    const data = await getRevenue(request.query);
    response.json(envelope(data, data.length));
  })
);

dashboardRouter.get(
  "/api/dashboard/categories",
  asyncHandler(async (request, response) => {
    const data = await getCategories(request.query);
    response.json(envelope(data, data.length));
  })
);

dashboardRouter.get(
  "/api/dashboard/regions",
  asyncHandler(async (request, response) => {
    const data = await getRegions(request.query);
    response.json(envelope(data, data.length));
  })
);

dashboardRouter.get(
  "/api/dashboard/channels",
  asyncHandler(async (request, response) => {
    const data = await getChannels(request.query);
    response.json(envelope(data, data.length));
  })
);

dashboardRouter.get(
  "/api/dashboard/cohorts",
  asyncHandler(async (request, response) => {
    const data = await getCohorts(request.query);
    response.json(envelope(data, data.length));
  })
);

dashboardRouter.get(
  "/api/dashboard/forecast",
  asyncHandler(async (request, response) => {
    response.json(envelope(await getForecast(request.query)));
  })
);

dashboardRouter.get(
  "/api/dashboard/anomalies",
  asyncHandler(async (request, response) => {
    const data = await getAnomalies(request.query);
    response.json(envelope(data, data.length));
  })
);
