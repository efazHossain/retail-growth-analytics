import { authStorageKey } from "./authApi";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export type InsightConfidence = "low" | "medium" | "high";

export type InsightEvidence = {
  metric: string;
  value: string | number;
  comparison?: string;
  source: string;
  period?: string;
  dimension?: string;
};

export type InsightAnswer = {
  question: string;
  answer: string;
  confidence: InsightConfidence;
  evidence: InsightEvidence[];
  recommended_actions: string[];
  provider: "rule_based" | "external_llm";
  suggested_questions?: string[];
};

type ApiEnvelope<T> = {
  status: string;
  data: T;
};

function authHeaders() {
  const token = localStorage.getItem(authStorageKey);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, init);
  const payload = (await response.json()) as ApiEnvelope<T> & { message?: string };

  if (!response.ok || payload.status !== "ok") {
    throw new Error(payload.message ?? "Insights request failed");
  }

  return payload.data;
}

export async function askInsight(question: string) {
  return request<InsightAnswer>("/api/insights/ask", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question })
  });
}

export async function getInsightSuggestions() {
  const headers = authHeaders();
  return request<{ suggestions: string[] }>("/api/insights/suggestions", { headers });
}

export async function getInsightHealth() {
  const headers = authHeaders();
  return request<{ provider: string; available: boolean; supported_questions: string[] }>("/api/insights/health", { headers });
}
