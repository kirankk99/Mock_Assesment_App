// Run with: npm run seed
// Loads every *.json file in data/ into MongoDB. Safe to re-run: it upserts on
// (section + question text) so you can edit any file in data/ (or drop in a
// brand new one, like data/devQuestionBank.json) and re-seed to grow the bank
// without creating duplicates.
import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Question from "../models/Question";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "MONGODB_URI is not set. Create a .env.local (or .env) file — see .env.example."
    );
    process.exit(1);
  }

  const dataDir = path.join(__dirname, "..", "data");
  const files = fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    console.error(`No .json files found in ${dataDir}`);
    process.exit(1);
  }

  await mongoose.connect(uri);

  let inserted = 0;
  let updated = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const questions = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    console.log(`Upserting ${questions.length} questions from ${file}...`);

    for (const q of questions) {
      const res = await Question.updateOne(
        { section: q.section, question: q.question },
        { $set: { ...q, active: true } },
        { upsert: true }
      );
      if (res.upsertedCount > 0) inserted++;
      else updated++;
    }
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
