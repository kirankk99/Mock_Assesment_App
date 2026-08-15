import { cookies, headers } from "next/headers";
import { SESSION_COOKIE_NAME, verifySession, type SessionPayload } from "@/lib/auth/jwt";
import type { UserRole } from "@/models/User";

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

// Re-verifies the cookie directly (no DB call). Use in app/api/* routes and
// the top-level /login, /register, /pending-approval, /403 pages — none of
// which are guaranteed to sit behind middleware's tenant path match.
export async function getAuthSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

// Cheap read of the headers middleware already forwarded. Use ONLY inside
// app/[org_slug]/**, which is guaranteed to have already passed middleware.
export function getTenantSessionFromHeaders(): SessionPayload {
  const h = headers();
  return {
    sub: h.get("x-user-id") ?? "",
    email: h.get("x-user-email") ?? "",
    name: h.get("x-user-name") ?? "",
    role: (h.get("x-user-role") ?? "GUEST") as UserRole,
    orgId: h.get("x-org-id") || null,
    orgSlug: h.get("x-org-slug") || null,
  };
}

export function requireRole(session: SessionPayload, ...roles: UserRole[]): void {
  if (!roles.includes(session.role)) {
    throw new ForbiddenError(`Requires role: ${roles.join(" or ")}`);
  }
}
