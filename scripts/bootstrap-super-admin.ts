// Run with: npm run bootstrap:super-admin
// Upserts the Super Admin account from env vars. There's no self-registration
// path for Super Admin (only Org Admins register themselves), so this script
// is the only way one gets created.
import "./load-env";
import mongoose from "mongoose";
import User from "../models/User";
import { hashPassword } from "../lib/password";

async function main() {
  const { MONGODB_URI, SUPER_ADMIN_EMAIL, SUPER_ADMIN_NAME, SUPER_ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI || !SUPER_ADMIN_EMAIL || !SUPER_ADMIN_NAME || !SUPER_ADMIN_PASSWORD) {
    console.error(
      "Missing MONGODB_URI / SUPER_ADMIN_EMAIL / SUPER_ADMIN_NAME / SUPER_ADMIN_PASSWORD. See .env.example."
    );
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const passwordHash = await hashPassword(SUPER_ADMIN_PASSWORD);
  await User.updateOne(
    { email: SUPER_ADMIN_EMAIL.toLowerCase() },
    {
      $set: {
        name: SUPER_ADMIN_NAME,
        passwordHash,
        role: "SUPER_ADMIN",
        orgId: null,
        isActive: true,
      },
    },
    { upsert: true }
  );

  console.log(`Super Admin ready: ${SUPER_ADMIN_EMAIL}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
