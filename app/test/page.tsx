"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAssessmentStore, type LastResult } from "@/lib/store";

function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function TestPage() {
  const router = useRouter();
  const hasHydrated = useAssessmentStore((s) => s.hasHydrated);
  const attempt = useAssessmentStore((s) => s.activeAttempt);
  const answerQuestion = useAssessmentStore((s) => s.answerQuestion);
  const clearActiveAttempt = useAssessmentStore((s) => s.clearActiveAttempt);
  const setLastResult = useAssessmentStore((s) => s.setLastResult);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!attempt) {
      router.replace("/");
      return;
    }
    const elapsed = Math.floor((Date.now() - attempt.startedAt) / 1000);
    setRemaining(attempt.durationSeconds - elapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  const doSubmit = useCallback(
    async (finalAnswers: (number | null)[]) => {
      if (submittedRef.current || !attempt) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        const res = await fetch("/api/attempt/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId: attempt.attemptId,
            answers: finalAnswers,
          }),
        });
        const data: LastResult & { error?: string } = await res.json();
        if (!res.ok) throw new Error(data.error || "Submit failed");
        setLastResult(data);
        clearActiveAttempt();
        router.push("/results");
      } catch (err) {
        alert(
          "Could not submit: " +
            (err instanceof Error ? err.message : String(err))
        );
        submittedRef.current = false;
        setSubmitting(false);
      }
    },
    [attempt, router, setLastResult, clearActiveAttempt]
  );

  // Timer tick
  useEffect(() => {
    if (!attempt) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - attempt.startedAt) / 1000);
      const left = attempt.durationSeconds - elapsed;
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        doSubmit(attempt.answers);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [attempt, doSubmit]);

  if (!hasHydrated || !attempt) return null;

  const questions = attempt.questions;
  const q = questions[currentIdx];
  const answered = attempt.answers.filter((a) => a !== null).length;

  function selectOption(optIdx: number) {
    answerQuestion(currentIdx, optIdx);
  }

  function goTo(idx: number) {
    setCurrentIdx(idx);
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      confirmSubmit();
    }
  }

  function confirmSubmit() {
    if (!attempt) return;
    const unanswered = attempt.answers.filter((a) => a === null).length;
    const msg =
      unanswered > 0
        ? `You have ${unanswered} unanswered question(s). Submit anyway?`
        : "Submit your test now?";
    if (confirm(msg)) {
      doSubmit(attempt.answers);
    }
  }

  function abortTest() {
    if (!attempt) return;
    if (
      confirm(
        "This will cancel your in-progress test and clear all your answers. Continue?"
      )
    ) {
      fetch("/api/attempt/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.attemptId }),
      }).catch(() => {});
      clearActiveAttempt();
      router.push("/");
    }
  }

  const lowTime = remaining <= 5 * 60;

  return (
    <div>
      <header className="app-header">
        <h1>Testing: Technical Aptitude</h1>
        <div className={`timer-box ${lowTime ? "low-time" : ""}`}>
          {formatTime(remaining)}
        </div>
      </header>

      <div className="app-shell">
        <div className="sidebar">
          <h3>
            Question Overview ({answered}/{questions.length} answered)
          </h3>
          <div className="nav-grid">
            {questions.map((_, idx) => (
              <button
                key={idx}
                className={`nav-btn ${idx === currentIdx ? "active" : ""} ${
                  attempt.answers[idx] !== null ? "answered" : ""
                }`}
                onClick={() => goTo(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="legend">
            <div>
              <span className="legend-dot bg-purple"></span>
              Current question
            </div>
            <div>
              <span className="legend-dot border border-purple bg-[#f3e5f5]"></span>
              Answered
            </div>
          </div>
          <div className="sidebar-actions">
            <button
              className="btn btn-primary"
              onClick={confirmSubmit}
              disabled={submitting}
            >
              Submit Exam
            </button>
            <button
              className="btn btn-secondary bg-[#ffebee] text-error-red"
              onClick={abortTest}
              disabled={submitting}
            >
              Cancel / Exit Test
            </button>
          </div>
        </div>

        <div className="quiz-area">
          <div className="section-tag">{q.section}</div>
          <div className="question-text">
            <strong>Q{currentIdx + 1}.</strong> {q.question}
          </div>

          {q.code && (
            <div className="code-container">
              <pre>{q.code}</pre>
            </div>
          )}

          <div className="options-group">
            {q.options.map((opt, oIdx) => (
              <label className="option-label" key={oIdx}>
                <input
                  type="radio"
                  name={`q-${currentIdx}`}
                  checked={attempt.answers[currentIdx] === oIdx}
                  onChange={() => selectOption(oIdx)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <div className="nav-actions">
            <button
              className="btn btn-secondary"
              onClick={() => goTo(currentIdx - 1)}
              disabled={currentIdx === 0}
            >
              Back
            </button>
            <button className="btn btn-primary" onClick={handleNext}>
              {currentIdx === questions.length - 1 ? "Review & Submit" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
