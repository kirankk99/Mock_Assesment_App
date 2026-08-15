import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attempt from "@/models/Attempt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { attemptId } = (await request.json()) as { attemptId?: string };
    if (attemptId) {
      await Attempt.findByIdAndUpdate(attemptId, { status: "aborted" });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
