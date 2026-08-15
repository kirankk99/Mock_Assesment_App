import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Organization from "@/models/Organization";
import User from "@/models/User";
import { verifyPassword } from "@/lib/password";
import { signSession, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    let orgSlug: string | null = null;
    if (user.role !== "SUPER_ADMIN") {
      const org = user.orgId ? await Organization.findById(user.orgId) : null;
      if (!org || org.status !== "Approved") {
        return NextResponse.json(
          { error: "Your organization is pending approval." },
          { status: 403 }
        );
      }
      orgSlug = org.orgSlug;
    }

    const passwordOk = await verifyPassword(password, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signSession({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId ? user.orgId.toString() : null,
      orgSlug,
    });

    // No Super Admin UI yet (later phase), so Super Admins land on the
    // public landing page for now instead of a tenant home.
    const redirectTo = orgSlug ? `/${orgSlug}/home` : "/";

    const response = NextResponse.json({
      redirectTo,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        orgSlug,
        avatarUrl: user.avatarUrl ?? null,
      },
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return response;
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
