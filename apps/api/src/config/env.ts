import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  API_PORT: z.coerce.number().default(3000),
  ANALYTICS_SERVICE_URL: z.string().url().default("http://analytics:8000"),
  DATABASE_URL: z.string().default("postgres://retail:retail@postgres:5432/retail_intelligence"),
  JWT_SECRET: z.string().min(16).default("dev-only-retail-intelligence-secret"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  CORS_ORIGIN: z.string().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
