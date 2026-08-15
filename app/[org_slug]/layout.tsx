import type { ReactNode } from "react";
import { getTenantSessionFromHeaders } from "@/lib/auth/session";
import LogoutButton from "./_components/LogoutButton";

// Bare shell for Phase 1 — validates the auth/RBAC skeleton end to end.
// Replaced by the real navbar/sidebar in Phase 2.
const TENANT_LINKS = [
  "home",
  "dashboard",
  "settings",
  "administration",
  "reports",
  "help",
  "help/feedback",
];

export default function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { org_slug: string };
}) {
  const session = getTenantSessionFromHeaders();

  return (
    <div>
      <header className="app-header">
        <h1>
          {params.org_slug} · {session.name} ({session.role})
        </h1>
        <LogoutButton />
      </header>
      <div className="container">
        <nav className="flex-row mb-5">
          {TENANT_LINKS.map((link) => (
            <a key={link} className="btn btn-secondary" href={`/${params.org_slug}/${link}`}>
              {link}
            </a>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
