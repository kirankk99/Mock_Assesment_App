"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessmentStore, type ClientQuestion } from "@/lib/store";

interface StartAttemptResponse {
  attemptId: string;
  questions: ClientQuestion[];
  durationSeconds: number;
  error?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const activeAttempt = useAssessmentStore((s) => s.activeAttempt);
  const lastResult = useAssessmentStore((s) => s.lastResult);
  const setActiveAttempt = useAssessmentStore((s) => s.setActiveAttempt);
  const clearActiveAttempt = useAssessmentStore((s) => s.clearActiveAttempt);
  const clearLastResult = useAssessmentStore((s) => s.clearLastResult);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startNewTest() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/attempt/start", { method: "POST" });
      const data: StartAttemptResponse = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start test");

      setActiveAttempt({
        attemptId: data.attemptId,
        questions: data.questions,
        durationSeconds: data.durationSeconds,
        startedAt: Date.now(),
        answers: Array(data.questions.length).fill(null),
      });
      router.push("/test");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function resumeTest() {
    router.push("/test");
  }

  async function resetEverything() {
    if (
      !confirm(
        "This will permanently clear your in-progress test and last result. Continue?"
      )
    )
      return;

    if (activeAttempt?.attemptId) {
      try {
        await fetch("/api/attempt/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId: activeAttempt.attemptId }),
        });
      } catch {
        // best-effort; still clear locally
      }
    }
    clearActiveAttempt();
    clearLastResult();
  }

  return (
    <div>
      <header className="app-header">
        <h1>Technical Aptitude Simulator</h1>
      </header>

      <div className="container">
        <h2 className="dashboard-title">Mock Assessment Dashboard</h2>

        {error && (
          <div className="card border-error-red">
            <p className="text-error-red">{error}</p>
          </div>
        )}

        <div className="card">
          <h3 className="mb-[10px]">30 Questions · 60 Minutes</h3>
          <p className="muted mb-5">
            Modeled current cognitive &amp; technical
            assessment sections: Verbal Ability, Logical Reasoning,
            Quantitative Aptitude, Pseudocode &amp; Programming Logic,
            Networking/Security/Cloud, and Core CS Fundamentals. Questions and
            option order are freshly shuffled every time you start a test.
          </p>

          {activeAttempt ? (
            <div className="flex-row">
              <button className="btn btn-primary" onClick={resumeTest}>
                Resume In-Progress Test
              </button>
              <button
                className="btn btn-secondary"
                onClick={startNewTest}
                disabled={loading}
              >
                Abandon &amp; Start a Fresh Test
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={startNewTest}
              disabled={loading}
            >
              {loading ? "Preparing test..." : "Start New Test"}
            </button>
          )}
        </div>

        {lastResult && (
          <div className="card">
            <h3 className="mb-[10px]">Last Result</h3>
            <p className="muted mb-[15px]">
              Score: <strong>{lastResult.score}</strong> / {lastResult.total}
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => router.push("/results")}
            >
              View Detailed Review
            </button>
          </div>
        )}

        <div className="card">
          <h3 className="mb-[10px]">Reset</h3>
          <p className="muted mb-[15px]">
            Clears any in-progress test and your last saved result from this
            browser.
          </p>
          <button className="btn btn-danger" onClick={resetEverything}>
            Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
}
