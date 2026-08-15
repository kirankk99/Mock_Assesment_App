import { getTenantSessionFromHeaders } from "@/lib/auth/session";

export default function TenantHomePage() {
  const session = getTenantSessionFromHeaders();
  return (
    <div className="card">
      <h2 className="mb-[10px]">Home</h2>
      <p className="muted">
        Signed in as {session.name} ({session.email}), role {session.role}, org{" "}
        {session.orgSlug}.
      </p>
    </div>
  );
}
