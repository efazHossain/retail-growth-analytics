import type { Request, RequestHandler } from "express";
import type { AuthUser, Role } from "../services/authService.js";
import { verifyAccessToken } from "../services/authService.js";

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

export const requireAuth: RequestHandler = (request, response, next) => {
  const authRequest = request as AuthenticatedRequest;
  const header = authRequest.header("authorization");
  const [scheme, token] = header?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    response.status(401).json({
      status: "error",
      message: "Authentication required"
    });
    return;
  }

  const user = verifyAccessToken(token);
  if (!user) {
    response.status(401).json({
      status: "error",
      message: "Invalid or expired token"
    });
    return;
  }

  authRequest.user = user;
  next();
};

export function requireRoles(...roles: Role[]): RequestHandler {
  return (request, response, next) => {
    const authRequest = request as AuthenticatedRequest;

    if (!authRequest.user) {
      response.status(401).json({
        status: "error",
        message: "Authentication required"
      });
      return;
    }

    if (authRequest.user.role === "admin" || roles.includes(authRequest.user.role)) {
      next();
      return;
    }

    response.status(403).json({
      status: "error",
      message: "Forbidden for current role"
    });
  };
}
