import { env } from "../config/env.js";
import { pool } from "../db/pool.js";

type DependencyStatus = {
  status: "ok" | "degraded";
  latencyMs?: number;
  message?: string;
};

async function timedCheck(check: () => Promise<void>): Promise<DependencyStatus> {
  const startedAt = Date.now();

  try {
    await check();
    return { status: "ok", latencyMs: Date.now() - startedAt };
  } catch (error) {
    return {
      status: "degraded",
      latencyMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "Unknown dependency check failure"
    };
  }
}

export async function getApiStatus() {
  const [postgres, analytics] = await Promise.all([
    timedCheck(async () => {
      await pool.query("select 1");
    }),
    timedCheck(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      try {
        const response = await fetch(`${env.ANALYTICS_SERVICE_URL}/health`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Analytics service returned ${response.status}`);
        }
      } finally {
        clearTimeout(timeout);
      }
    })
  ]);

  const dependencies = { postgres, analytics };
  const healthy = Object.values(dependencies).every((dependency) => dependency.status === "ok");

  return {
    status: healthy ? "ok" : "degraded",
    service: "retail-intelligence-api",
    environment: env.NODE_ENV,
    dependencies
  };
}
