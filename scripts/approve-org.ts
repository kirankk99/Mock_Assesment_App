// Run with: npm run approve-org -- <org_slug>
// Phase-1 stand-in for the real Super Admin approval UI (a later phase).
import "./load-env";
import mongoose from "mongoose";
import crypto from "crypto";
import Organization from "../models/Organization";
import AppLicense from "../models/AppLicense";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npm run approve-org -- <org_slug>");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. See .env.example.");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const org = await Organization.findOneAndUpdate(
    { orgSlug: slug },
    { status: "Approved" },
    { new: true }
  );
  if (!org) {
    console.error(`No organization with slug "${slug}"`);
    process.exit(1);
  }

  await AppLicense.updateOne(
    { orgId: org._id },
    {
      $setOnInsert: {
        orgId: org._id,
        licenseKey: crypto.randomUUID(),
        startDate: new Date(),
        endDate: new Date(Date.now() + ONE_YEAR_MS),
        isActive: true,
      },
    },
    { upsert: true }
  );

  console.log(`Approved "${org.orgName}" (${slug}); default AppLicense ensured.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
