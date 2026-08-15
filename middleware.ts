import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/jwt";

const SESSION_COOKIE_NAME = "acn_session";

// Static top-level routes that must never go through tenant auth/org
// checks. Kept in sync with lib/slug.ts's RESERVED_SLUGS so no org can ever
// claim a slug that collides with one of these.
const BYPASS_PREFIXES = [
  "/test",
  "/results",
  "/api",
  "/login",
  "/register",
  "/pending-approval",
  "/403",
];

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/" || BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const [orgSlugFromUrl] = pathname.split("/").filter(Boolean);
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const session = await verifySession(token);

    // Also how a SUPER_ADMIN token (orgSlug: null) gets blocked from tenant
    // URLs in Phase 1 — no cross-org "Log as Admin" yet.
    if (session.orgSlug !== orgSlugFromUrl) {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    const headers = new Headers(req.headers);
    headers.set("x-user-id", session.sub);
    headers.set("x-user-email", session.email);
    headers.set("x-user-name", session.name);
    headers.set("x-user-role", session.role);
    headers.set("x-org-id", session.orgId ?? "");
    headers.set("x-org-slug", session.orgSlug ?? "");
    return NextResponse.next({ request: { headers } });
  } catch {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }
}
