import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type Role = "admin" | "analyst" | "executive";

export type AuthUser = {
  username: string;
  role: Role;
  displayName: string;
};

type DemoUserRecord = AuthUser & {
  passwordSalt: string;
  passwordHash: string;
};

type TokenPayload = {
  sub: string;
  role: Role;
  displayName: string;
};

const demoUsers: DemoUserRecord[] = [
  {
    username: "admin",
    displayName: "Admin User",
    role: "admin",
    passwordSalt: "retail-admin-demo-salt",
    passwordHash:
      "a3465e5e05925e378f29c89bf3acfac1ff97431b7d98e8108f0d803df79e2b15e9b3110bce0af02d95515e8519522539b1f32e5d1a319f23a4b189f51b69fcf8"
  },
  {
    username: "analyst",
    displayName: "Analyst User",
    role: "analyst",
    passwordSalt: "retail-analyst-demo-salt",
    passwordHash:
      "45a6ece990ac56008653641572e8ae8d891561e1bc216ecd716f685b6e94484c6d4b68b9956c5f0694e6c1fe39f7df0f5e251a284aac598a5319e185c9d8b709"
  },
  {
    username: "executive",
    displayName: "Executive User",
    role: "executive",
    passwordSalt: "retail-executive-demo-salt",
    passwordHash:
      "a451db9ade76645101e6f9a2294546d43a5e59a89ac2d2c1b987a3881f28a1a4596b5871ba77941ec9efa97c80a9311e4d271803671c02282f5f775f1e202a5c"
  }
];

export const tokenExpiresIn = env.JWT_EXPIRES_IN;

export function publicUser(user: AuthUser): AuthUser {
  return {
    username: user.username,
    role: user.role,
    displayName: user.displayName
  };
}

export function authenticateDemoUser(username: string, password: string): AuthUser | null {
  const user = demoUsers.find((record) => record.username === username);
  if (!user) return null;

  const candidateHash = crypto.scryptSync(password, user.passwordSalt, 64).toString("hex");
  const expected = Buffer.from(user.passwordHash, "hex");
  const candidate = Buffer.from(candidateHash, "hex");

  if (candidate.length !== expected.length || !crypto.timingSafeEqual(candidate, expected)) {
    return null;
  }

  return publicUser(user);
}

export function signAccessToken(user: AuthUser) {
  const payload: TokenPayload = {
    sub: user.username,
    role: user.role,
    displayName: user.displayName
  };

  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    if (!payload.sub || !payload.role || !payload.displayName) return null;
    if (!["admin", "analyst", "executive"].includes(payload.role)) return null;

    return {
      username: payload.sub,
      role: payload.role,
      displayName: payload.displayName
    };
  } catch {
    return null;
  }
}
