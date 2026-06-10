import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getApiStatus } from "../services/statusService.js";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "retail-intelligence-api"
  });
});

healthRouter.get(
  "/status",
  asyncHandler(async (_request, response) => {
    const status = await getApiStatus();
    response.status(status.status === "ok" ? 200 : 503).json(status);
  })
);

healthRouter.get(
  "/api/status",
  asyncHandler(async (_request, response) => {
    const status = await getApiStatus();
    response.status(status.status === "ok" ? 200 : 503).json(status);
  })
);
