import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestLogger(request: Request, response: Response, next: NextFunction) {
  const startedAt = Date.now();
  const requestId = request.header("x-request-id") ?? randomUUID();

  response.locals.requestId = requestId;
  response.setHeader("x-request-id", requestId);

  response.on("finish", () => {
    console.log(
      JSON.stringify({
        level: "info",
        message: "request completed",
        requestId,
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Date.now() - startedAt
      })
    );
  });

  next();
}
