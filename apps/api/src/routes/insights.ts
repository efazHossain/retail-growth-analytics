import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateBody } from "../middleware/validate.js";
import { answerInsightQuestion, getInsightHealth, getInsightSuggestions } from "../services/insightService.js";
import { envelope } from "../services/dashboardService.js";

export const insightsRouter = Router();

const askInsightSchema = z.object({
  question: z.string().trim().min(1, "question is required").max(500, "question must be 500 characters or fewer")
});

insightsRouter.get(
  "/api/insights/health",
  requireAuth,
  asyncHandler(async (_request, response) => {
    response.json(envelope(getInsightHealth()));
  })
);

insightsRouter.get(
  "/api/insights/suggestions",
  requireAuth,
  asyncHandler(async (_request, response) => {
    response.json(envelope({ suggestions: getInsightSuggestions() }));
  })
);

insightsRouter.post(
  "/api/insights/ask",
  requireAuth,
  validateBody(askInsightSchema),
  asyncHandler(async (request, response) => {
    const { question } = request.body as z.infer<typeof askInsightSchema>;
    response.json(envelope(await answerInsightQuestion(question)));
  })
);
