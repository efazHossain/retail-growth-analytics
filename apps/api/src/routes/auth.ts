import rateLimit from "express-rate-limit";
import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { authenticateDemoUser, publicUser, signAccessToken, tokenExpiresIn } from "../services/authService.js";

export const authRouter = Router();

const loginSchema = z.object({
  username: z.string().trim().min(1).max(40),
  password: z.string().min(1).max(120)
});

const loginLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many login attempts. Try again shortly."
  }
});

authRouter.post("/api/auth/login", loginLimiter, validateBody(loginSchema), (request, response) => {
  const { username, password } = request.body as z.infer<typeof loginSchema>;
  const user = authenticateDemoUser(username, password);

  if (!user) {
    response.status(401).json({
      status: "error",
      message: "Invalid username or password"
    });
    return;
  }

  response.json({
    status: "ok",
    data: {
      accessToken: signAccessToken(user),
      tokenType: "Bearer",
      expiresIn: tokenExpiresIn,
      user: publicUser(user)
    }
  });
});

authRouter.get("/api/auth/me", requireAuth, (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  response.json({
    status: "ok",
    data: {
      user: authRequest.user
    }
  });
});

authRouter.post("/api/auth/logout", requireAuth, (_request, response) => {
  response.json({
    status: "ok",
    data: {
      message: "JWT logout is handled client-side for the local MVP."
    }
  });
});
