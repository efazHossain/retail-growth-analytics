export const authStorageKey = "retail_intelligence_access_token";
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export type Role = "admin" | "analyst" | "executive";

export type AuthUser = {
  username: string;
  role: Role;
  displayName: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: AuthUser;
};

type ApiEnvelope<T> = {
  status: string;
  data: T;
};

async function parseEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T> & { message?: string };

  if (!response.ok || payload.status !== "ok") {
    throw new Error(payload.message ?? "Authentication request failed");
  }

  return payload.data;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  return parseEnvelope<LoginResponse>(response);
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = await parseEnvelope<{ user: AuthUser }>(response);

  return data.user;
}
