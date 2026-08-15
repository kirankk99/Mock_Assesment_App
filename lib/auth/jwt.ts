import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/models/User";

// jose (not jsonwebtoken) because this is verified from middleware.ts, which
// runs on the Edge runtime.
export const SESSION_COOKIE_NAME = "acn_session";
export const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS) || 604800; // 7 days

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string | null;
  orgSlug: string | null;
}

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to .env.local — see .env.example.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload as unknown as SessionPayload;
}
