---
name: run
description: Launch this Next.js app (aptitude-simulator) and verify a change works
model: haiku
effort: low
---

This is a Next.js 14 app (app router). To run it:

1. Make sure `.env.local` has `MONGODB_URI` set (see `.env.example`) — the app
   talks to MongoDB via `lib/mongodb.ts` and will error on API routes without it.
2. Start the dev server: `npm run dev`
3. Open http://localhost:3000
4. Exercise the relevant flow:
   - `/` — landing page
   - `/test` — the assessment/question flow
   - `/results` — results page
   - `/api/attempt/*` — API routes backing the above
5. Stop the dev server when done.

If a build (not dev) needs verifying instead, use `npm run build` — do not use
`npm run package` for this (that produces a full deployable tarball via
`scripts/build-package.ts` and is much more expensive than needed just to check
a change).
