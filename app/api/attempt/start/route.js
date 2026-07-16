import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import Attempt from "@/models/Attempt";

const QUESTIONS_PER_TEST = 30;
const DURATION_SECONDS = 60 * 60; // 60 minutes

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST() {
  try {
    await connectDB();

    const sections = await Question.distinct("section", { active: true });
    if (sections.length === 0) {
      return NextResponse.json(
        {
          error:
            "No questions found in the database. Run `npm run seed` first.",
        },
        { status: 400 }
      );
    }

    const perSection = Math.max(
      1,
      Math.floor(QUESTIONS_PER_TEST / sections.length)
    );

    let picked = [];
    for (const section of sections) {
      const pool = await Question.aggregate([
        { $match: { active: true, section } },
        { $sample: { size: perSection } },
      ]);
      picked = picked.concat(pool);
    }

    // Top up (or trim) to exactly QUESTIONS_PER_TEST if section counts don't divide evenly
    if (picked.length < QUESTIONS_PER_TEST) {
      const usedIds = picked.map((q) => q._id);
      const extra = await Question.aggregate([
        { $match: { active: true, _id: { $nin: usedIds } } },
        { $sample: { size: QUESTIONS_PER_TEST - picked.length } },
      ]);
      picked = picked.concat(extra);
    }
    picked = shuffle(picked).slice(0, QUESTIONS_PER_TEST);

    const snapshotQuestions = picked.map((q) => {
      const optionOrder = shuffle(q.options.map((_, i) => i));
      const shuffledOptions = optionOrder.map((i) => q.options[i]);
      const correctIndex = optionOrder.indexOf(q.correctIndex);

      return {
        questionId: q._id,
        section: q.section,
        question: q.question,
        code: q.code || null,
        options: shuffledOptions,
        correctIndex,
        explanation: q.explanation,
      };
    });

    const attempt = await Attempt.create({
      questions: snapshotQuestions,
      durationSeconds: DURATION_SECONDS,
      answers: Array(snapshotQuestions.length).fill(null),
      status: "in_progress",
    });

    // IMPORTANT: never send correctIndex or explanation to the client here.
    const clientQuestions = snapshotQuestions.map((q, idx) => ({
      index: idx,
      section: q.section,
      question: q.question,
      code: q.code,
      options: q.options,
    }));

    return NextResponse.json({
      attemptId: attempt._id.toString(),
      durationSeconds: DURATION_SECONDS,
      questions: clientQuestions,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
