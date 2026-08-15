import type { ReactNode } from "react";
import { getTenantSessionFromHeaders } from "@/lib/auth/session";
import TenantChrome from "./_components/TenantChrome";

export default function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { org_slug: string };
}) {
  const session = getTenantSessionFromHeaders();

  return (
    <TenantChrome session={session} orgSlug={params.org_slug}>
      {children}
    </TenantChrome>
  );
}
