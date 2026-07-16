// Run with: npm run seed
// Loads data/questionBank.json into MongoDB. Safe to re-run: it upserts on
// (section + question text) so you can edit questionBank.json (or paste in
// new questions you've sourced yourself) and re-seed to grow the bank without
// creating duplicates.
import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Question from "../models/Question.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "MONGODB_URI is not set. Create a .env.local (or .env) file — see .env.example."
    );
    process.exit(1);
  }

  const file = path.join(__dirname, "..", "data", "questionBank.json");
  const questions = JSON.parse(fs.readFileSync(file, "utf-8"));

  await mongoose.connect(uri);
  console.log(`Connected. Upserting ${questions.length} questions...`);

  let inserted = 0;
  let updated = 0;

  for (const q of questions) {
    const res = await Question.updateOne(
      { section: q.section, question: q.question },
      { $set: { ...q, active: true } },
      { upsert: true }
    );
    if (res.upsertedCount > 0) inserted++;
    else updated++;
  }

  console.log(`Done. Inserted: ${inserted}, Updated: ${updated}`);
  const total = await Question.countDocuments({ active: true });
  console.log(`Total active questions in bank: ${total}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
