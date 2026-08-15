import { getTenantSessionFromHeaders, requireRole, ForbiddenError } from "@/lib/auth/session";

export default function TenantAdministrationPage() {
  const session = getTenantSessionFromHeaders();

  try {
    requireRole(session, "ORG_ADMIN");
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return (
        <div className="card border-error-red">
          <p className="text-error-red">{err.message}</p>
        </div>
      );
    }
    throw err;
  }

  return (
    <div className="card">
      <h2 className="mb-[10px]">Administration</h2>
      <p className="muted">Placeholder — built out in a later phase. Org Admin only.</p>
    </div>
  );
}
