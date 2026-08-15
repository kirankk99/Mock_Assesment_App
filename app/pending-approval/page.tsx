export default function PendingApprovalPage() {
  return (
    <div className="auth-container">
      <h2 className="dashboard-title">Registration Submitted</h2>
      <div className="card center">
        <p className="muted">
          Your organization has been registered and is awaiting approval. You'll be able to log
          in once an administrator approves it.
        </p>
        <a className="btn btn-secondary mt-5 inline-block" href="/login">
          Back to Log In
        </a>
      </div>
    </div>
  );
}
