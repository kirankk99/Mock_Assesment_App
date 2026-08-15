import Organization from "@/models/Organization";

// Reserved so no org can ever claim a slug that collides with a static
// top-level route (app/test, app/login, etc. resolve before app/[org_slug]).
const RESERVED_SLUGS = new Set([
  "api",
  "test",
  "results",
  "login",
  "register",
  "logout",
  "pending-approval",
  "403",
  "favicon.ico",
  "_next",
  "robots.txt",
  "sitemap.xml",
]);

export function slugify(orgName: string): string {
  return orgName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function generateUniqueOrgSlug(orgName: string): Promise<string> {
  const base = slugify(orgName) || "org";
  let candidate = base;
  let suffix = 1;

  while (RESERVED_SLUGS.has(candidate) || (await Organization.exists({ orgSlug: candidate }))) {
    suffix += 1;
    candidate = `${base}_${suffix}`;
  }

  return candidate;
}
