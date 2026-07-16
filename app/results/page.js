"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadLastResult, clearLastResult } from "@/lib/storage";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const r = loadLastResult();
    if (!r) {
      router.replace("/");
      return;
    }
    setResult(r);
  }, [router]);

  if (!result) return null;

  function resetAndGoHome() {
    if (
      confirm("This will clear your saved result. Start fresh from the dashboard?")
    ) {
      clearLastResult();
      router.push("/");
    }
  }

  return (
    <div>
      <header className="app-header">
        <h1>Accenture India Technical Aptitude Simulator</h1>
      </header>

      <div className="quiz-area" style={{ overflowY: "visible" }}>
        <div className="results-container">
          <div className="score-card">
            <h2>Test Completed!</h2>
            <div className="score-circle">
              {result.score}/{result.total}
            </div>
            <div className="flex-row" style={{ justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={() => router.push("/")}>
                Back to Dashboard
              </button>
              <button className="btn btn-danger" onClick={resetAndGoHome}>
                Reset
              </button>
            </div>
          </div>

          <h2
            style={{
              marginBottom: 20,
              borderBottom: "2px solid var(--accenture-purple)",
              paddingBottom: 10,
            }}
          >
            Explanatory Performance Review
          </h2>

          {result.review.map((item) => (
            <div className="review-item" key={item.index}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <div className="section-tag">{item.section}</div>
                <span
                  className={`review-status ${
                    item.isCorrect ? "correct" : "incorrect"
                  }`}
                >
                  {item.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              <h3 style={{ marginBottom: 10, fontSize: 15 }}>
                Q{item.index + 1}. {item.question}
              </h3>
              {item.code && <div className="review-code">{item.code}</div>}
              <p style={{ fontSize: 14, marginBottom: 5 }}>
                <strong>Your Choice:</strong>{" "}
                {item.chosenIndex !== null ? (
                  item.options[item.chosenIndex]
                ) : (
                  <span style={{ color: "var(--error-red)" }}>Unattempted</span>
                )}
              </p>
              {!item.isCorrect && (
                <p style={{ fontSize: 14, marginBottom: 5, color: "var(--success-green)" }}>
                  <strong>Correct Answer:</strong> {item.options[item.correctIndex]}
                </p>
              )}
              <div className="explanation-box">
                <strong>Explanation:</strong>
                <br />
                {item.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
