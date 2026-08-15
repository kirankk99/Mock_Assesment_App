import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Organization from "@/models/Organization";
import User from "@/models/User";
import { generateUniqueOrgSlug } from "@/lib/slug";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { orgName, adminName, adminEmail, password } = await req.json();

    if (!orgName || !adminName || !adminEmail || !password) {
      return NextResponse.json(
        { error: "orgName, adminName, adminEmail, and password are all required." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const email = String(adminEmail).toLowerCase().trim();
    const existing = await User.exists({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const orgSlug = await generateUniqueOrgSlug(orgName);
    const organization = await Organization.create({ orgName, orgSlug, status: "Pending" });

    const passwordHash = await hashPassword(password);
    await User.create({
      orgId: organization._id,
      name: adminName,
      email,
      passwordHash,
      role: "ORG_ADMIN",
    });

    // No session cookie here: a Pending org grants no access yet.
    return NextResponse.json(
      { orgSlug: organization.orgSlug, status: organization.status },
      { status: 201 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
