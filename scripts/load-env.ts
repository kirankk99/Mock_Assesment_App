// dotenv/config only auto-loads .env, not .env.local (unlike Next.js itself,
// which loads .env.local over .env). Load .env.local first so local dev
// scripts see the same values `npm run dev`/`npm run build` do, then fall
// back to .env for anything not already set.
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();
