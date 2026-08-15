"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/lib/store";

export default function ResultsPage() {
  const router = useRouter();
  const hasHydrated = useAssessmentStore((s) => s.hasHydrated);
  const result = useAssessmentStore((s) => s.lastResult);
  const clearLastResult = useAssessmentStore((s) => s.clearLastResult);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!result) {
      router.replace("/");
    }
  }, [hasHydrated, result, router]);

  if (!hasHydrated || !result) return null;

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
        <h1>Technical Aptitude Simulator</h1>
      </header>

      <div className="quiz-area overflow-y-visible">
        <div className="results-container">
          <div className="score-card">
            <h2>Test Completed!</h2>
            <div className="score-circle">
              {result.score}/{result.total}
            </div>
            <div className="flex-row justify-center">
              <button className="btn btn-secondary" onClick={() => router.push("/")}>
                Back to Dashboard
              </button>
              <button className="btn btn-danger" onClick={resetAndGoHome}>
                Reset
              </button>
            </div>
          </div>

          <h2 className="mb-5 border-b-2 border-purple pb-[10px]">
            Explanatory Performance Review
          </h2>

          {result.review.map((item) => (
            <div className="review-item" key={item.index}>
              <div className="mb-[10px] flex items-center justify-between">
                <div className="section-tag">{item.section}</div>
                <span
                  className={`review-status ${
                    item.isCorrect ? "correct" : "incorrect"
                  }`}
                >
                  {item.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              <h3 className="mb-[10px] text-[15px]">
                Q{item.index + 1}. {item.question}
              </h3>
              {item.code && <div className="review-code">{item.code}</div>}
              <p className="mb-[5px] text-sm">
                <strong>Your Choice:</strong>{" "}
                {item.chosenIndex !== null ? (
                  item.options[item.chosenIndex]
                ) : (
                  <span className="text-error-red">Unattempted</span>
                )}
              </p>
              {!item.isCorrect && (
                <p className="mb-[5px] text-sm text-success-green">
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
