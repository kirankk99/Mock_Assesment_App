export default function ForbiddenPage() {
  return (
    <div className="auth-container">
      <h2 className="dashboard-title">Not Authorized</h2>
      <div className="card center">
        <p className="muted">
          You don't have access to this organization's workspace with the account you're
          currently logged in with.
        </p>
        <a className="btn btn-secondary mt-5 inline-block" href="/login">
          Log In With a Different Account
        </a>
      </div>
    </div>
  );
}
