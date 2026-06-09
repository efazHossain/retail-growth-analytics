import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(JSON.stringify({ level: "error", message: error.message, stack: error.stack }));

  response.status(500).json({
    status: "error",
    message: "Unexpected API error"
  });
};
