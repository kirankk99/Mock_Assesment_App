import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthSession } from "@/lib/auth/session";
import cloudinary from "@/lib/cloudinary";

// Uploads via the Cloudinary Node SDK, which needs a real TCP connection —
// this must stay on the Node runtime, never Edge (unlike middleware.ts).
export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Expected a multipart form with an avatar file." },
        { status: 400 }
      );
    }
    const file = formData.get("avatar");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "An avatar file is required." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be 2MB or smaller." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "assessmenttool/avatars",
      public_id: session.sub,
      overwrite: true,
    });

    await connectDB();
    await User.findByIdAndUpdate(session.sub, { avatarUrl: result.secure_url });

    return NextResponse.json({ avatarUrl: result.secure_url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
