import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";
import { ZodError } from "zod";

export function validateBody(schema: AnyZodObject) {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      request.body = schema.parse(request.body);
      next();
    } catch (error) {
      response.status(400).json({
        status: "error",
        message: "Invalid request body",
        issues: error instanceof ZodError ? error.issues.map((issue) => issue.message) : undefined
      });
    }
  };
}

export function validateQuery(schema: AnyZodObject) {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      request.query = schema.parse(request.query);
      next();
    } catch (error) {
      response.status(400).json({
        status: "error",
        message: "Invalid query parameters",
        issues: error instanceof ZodError ? error.issues.map((issue) => issue.message) : undefined
      });
    }
  };
}
