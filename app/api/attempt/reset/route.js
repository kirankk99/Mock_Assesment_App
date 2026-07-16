import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attempt from "@/models/Attempt";

export async function POST(request) {
  try {
    await connectDB();
    const { attemptId } = await request.json();
    if (attemptId) {
      await Attempt.findByIdAndUpdate(attemptId, { status: "aborted" });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
