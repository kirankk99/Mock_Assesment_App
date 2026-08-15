"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionStore } from "@/lib/sessionStore";
import type { UserRole } from "@/models/User";

interface LoginResponse {
  redirectTo: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    orgSlug: string | null;
    avatarUrl: string | null;
  };
  error?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useSessionStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: LoginResponse = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      setUser(data.user);
      const redirectTo = searchParams.get("redirectTo") || data.redirectTo;
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h2 className="dashboard-title">Log In</h2>

      {error && (
        <div className="card border-error-red">
          <p className="text-error-red">{error}</p>
        </div>
      )}

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
        <p className="muted mt-3">
          No organization yet? <a href="/register">Register one</a>.
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
