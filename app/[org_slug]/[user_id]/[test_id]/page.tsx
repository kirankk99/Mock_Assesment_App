// Route-shape stub only. The real test-taking flow (currently at /test,
// /results, /api/attempt/*) migrates here in a later phase, at which point
// Question/Attempt gain an orgId and this becomes user- and org-scoped.
export default function TenantTestPage({
  params,
}: {
  params: { org_slug: string; user_id: string; test_id: string };
}) {
  return (
    <div className="card">
      <h2 className="mb-[10px]">Test (stub)</h2>
      <p className="muted">
        org: {params.org_slug} · user: {params.user_id} · test: {params.test_id}
      </p>
      <p className="muted mt-3">
        Route shape only — the real assessment flow migrates here in a later phase.
      </p>
    </div>
  );
}
