import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(
    JSON.stringify({
      level: "error",
      message: error.message,
      requestId: response.locals.requestId,
      stack: error.stack
    })
  );

  response.status(500).json({
    status: "error",
    message: "Unexpected API error",
    requestId: response.locals.requestId,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};
