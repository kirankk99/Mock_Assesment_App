"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegisterResponse {
  orgSlug: string;
  status: string;
  error?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [orgName, setOrgName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, adminName, adminEmail, password }),
      });
      const data: RegisterResponse = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      router.push("/pending-approval");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h2 className="dashboard-title">Register Your Organization</h2>

      {error && (
        <div className="card border-error-red">
          <p className="text-error-red">{error}</p>
        </div>
      )}

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="orgName">
            Organization Name
          </label>
          <input
            id="orgName"
            type="text"
            className="form-input"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="adminName">
            Your Name
          </label>
          <input
            id="adminName"
            type="text"
            className="form-input"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="adminEmail">
            Your Email
          </label>
          <input
            id="adminEmail"
            type="email"
            className="form-input"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Register Organization"}
        </button>
        <p className="muted mt-3">
          Already registered? <a href="/login">Log in</a>.
        </p>
      </form>
    </div>
  );
}
