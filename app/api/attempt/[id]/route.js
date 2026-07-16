import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attempt from "@/models/Attempt";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const attempt = await Attempt.findById(params.id);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const clientQuestions = attempt.questions.map((q, idx) => ({
      index: idx,
      section: q.section,
      question: q.question,
      code: q.code,
      options: q.options,
    }));

    return NextResponse.json({
      attemptId: attempt._id.toString(),
      status: attempt.status,
      durationSeconds: attempt.durationSeconds,
      questions: clientQuestions,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
