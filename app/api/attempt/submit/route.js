import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attempt from "@/models/Attempt";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { attemptId, answers } = body; // answers: array of (optionIndex|null), same length/order as questions

    if (!attemptId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "attemptId and answers[] are required" },
        { status: 400 }
      );
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status === "completed") {
      // Idempotent: if already graded, just return the stored result again.
      return NextResponse.json(buildResult(attempt));
    }

    let score = 0;
    const review = attempt.questions.map((q, idx) => {
      const chosen = answers[idx] ?? null;
      const isCorrect = chosen !== null && chosen === q.correctIndex;
      if (isCorrect) score++;
      return {
        index: idx,
        section: q.section,
        question: q.question,
        code: q.code,
        options: q.options,
        chosenIndex: chosen,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    attempt.answers = attempt.questions.map((_, idx) => answers[idx] ?? null);
    attempt.score = score;
    attempt.status = "completed";
    attempt.completedAt = new Date();
    await attempt.save();

    return NextResponse.json({
      attemptId: attempt._id.toString(),
      score,
      total: attempt.questions.length,
      review,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function buildResult(attempt) {
  const review = attempt.questions.map((q, idx) => ({
    index: idx,
    section: q.section,
    question: q.question,
    code: q.code,
    options: q.options,
    chosenIndex: attempt.answers[idx] ?? null,
    correctIndex: q.correctIndex,
    isCorrect: attempt.answers[idx] === q.correctIndex,
    explanation: q.explanation,
  }));
  return {
    attemptId: attempt._id.toString(),
    score: attempt.score,
    total: attempt.questions.length,
    review,
  };
}
