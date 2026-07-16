# Accenture India Technical Aptitude Simulator

A full mock-test app modeled on Accenture's current (2026) hiring assessment
sections: **Verbal Ability, Logical Reasoning, Quantitative Aptitude,
Pseudocode & Programming Logic, Networking/Security/Cloud, and Core CS
Fundamentals**.

- 30 questions per attempt, 60-minute timer
- Question bank stored in **MongoDB** — questions and option order are
  randomly shuffled every time you start a test, so no two attempts look
  identical
- Timer, current question, and per-question answer status are tracked in the
  browser's **localStorage**, so a refresh or accidental tab close doesn't
  lose your progress
- Grading and the correct-answer key live only on the **server** (Next.js API
  routes) — the client never receives the answer key until you submit
- After submitting: see your score, then every question with your answer,
  the correct answer, and a short explanation
- **Reset** button to wipe an in-progress test or a saved result and start
  clean

> ⚠️ One important honesty note: I can't have this app silently "go fetch
> today's leaked Accenture questions from the internet" for you — reproducing
> someone else's copyrighted question bank isn't something I'll build, and a
> live scraper for that content would be brittle/unreliable anyway. What I've
> built instead is a **growable** bank: 60 original questions seeded in, an
> architecture that supports adding hundreds more, and a clean `npm run seed`
> workflow so you (or a script you write) can drop new questions into
> `data/questionBank.json` and re-seed at any time without duplicating
> existing ones.

---

## 1. Project structure

```
accenture-aptitude-simulator/
├── app/
│   ├── page.js              # Dashboard: start/resume test, view last result, reset
│   ├── test/page.js          # Quiz screen (timer, question nav, answering)
│   ├── results/page.js       # Score + explanatory review
│   ├── layout.js / globals.css
│   └── api/
│       └── attempt/
│           ├── start/route.js    # POST -> builds a new 30-question attempt
│           ├── [id]/route.js     # GET  -> fetch an attempt's questions (no answers)
│           ├── submit/route.js   # POST -> grades server-side, returns review
│           └── reset/route.js    # POST -> marks an attempt aborted
├── models/
│   ├── Question.js           # The question bank schema
│   └── Attempt.js            # A frozen snapshot of one 30-question test run
├── lib/
│   ├── mongodb.js            # Cached Mongo connection (serverless-safe)
│   └── storage.js            # localStorage helpers used by the client pages
├── data/questionBank.json    # 60 original seed questions (10 per section)
├── scripts/seed.mjs          # Upserts data/questionBank.json into MongoDB
├── netlify.toml
└── .env.example
```

## 2. Run it locally

You'll need Node.js 18.18+ and a MongoDB connection string (local `mongod`,
or a free MongoDB Atlas cluster — see step 4).

```bash
# unzip the folder first, then:
cd accenture-aptitude-simulator
npm i

cp .env.example .env.local
# edit .env.local and paste in your MONGODB_URI

npm run seed     # loads the 60 seed questions into your database
npm run dev      # http://localhost:3000
```

## 3. Growing / refreshing the question bank

`npm run seed` reads `data/questionBank.json` and **upserts** each question
by `(section, question text)` — so you can:

- Add more questions to `data/questionBank.json` (same shape as the existing
  entries: `section`, `question`, optional `code`, `options`, `correctIndex`,
  `explanation`) and re-run `npm run seed`. Existing questions won't be
  duplicated.
- Or add questions straight into MongoDB (e.g. via MongoDB Compass or
  Atlas's Data Explorer) using the `Question` collection directly.
- `POST /api/attempt/start` always randomly samples across whatever's
  currently `active: true` in the database, split evenly across the 6
  sections — so the bank simply gets more varied as you add to it. There's
  no code change needed to "pick up" new questions.

If you want to automate importing from your own licensed question source
(e.g. an internal prep-question doc your college/training team has the
rights to), write a small script that maps that data into the same shape as
`data/questionBank.json` and either merges it into that file or calls
`Question.updateOne(...)` directly — the schema in `models/Question.js` is
the contract to follow.

## 4. Set up MongoDB Atlas (needed for Netlify deployment)

Netlify's serverless functions can't reach a database running on your own
laptop, so for production you need a cloud MongoDB instance:

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster
3. Under **Database Access**, create a user with a password
4. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) — simplest
   for a small personal project; tighten later if needed
5. Click **Connect > Drivers**, copy the connection string, and swap in your
   username/password and a database name, e.g.:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/accenture-sim?retryWrites=true&w=majority
   ```
6. Run `npm run seed` once locally with this URI in `.env.local` to populate
   the cloud database.

## 5. Deploy to Netlify

1. Push this folder to a GitHub repo (or use Netlify's "deploy manually" /
   drag-and-drop of the built `.next` folder — but a Git-connected deploy is
   much easier for a Next.js app with API routes).
2. In Netlify: **Add new site > Import an existing project**, pick the repo.
3. Netlify auto-detects Next.js; `netlify.toml` here already sets:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```
4. Under **Site configuration > Environment variables**, add:
   - `MONGODB_URI` = your Atlas connection string from step 4
5. Deploy. Netlify will install the `@netlify/plugin-nextjs` plugin
   automatically on first build (it's referenced in `netlify.toml`; Netlify
   fetches it — you don't need to add it to `package.json`).
6. Once live, your API routes (`/api/attempt/...`) run as Netlify Functions
   automatically — no extra setup.

### If you'd rather not use Git
Netlify also supports dragging a pre-built folder onto their dashboard, but
because this app has server-side API routes (not just static HTML), the
Git-connected + plugin approach above is strongly recommended — a plain
drag-and-drop of static files won't run the `/api/attempt/*` routes.

## 6. Notes on design decisions

- **Why a DB-side grading step instead of grading in the browser?** So the
  answer key is never shipped to the client before you submit — otherwise
  anyone could open dev tools and read the correct answers mid-test.
- **Why localStorage for the timer/answers?** Per your requirement — it
  keeps the in-progress experience fully client-side and instant (no network
  round-trip per click), while MongoDB holds the durable "source of truth"
  (question bank + the graded record of each attempt).
- **Timer resilience:** the remaining time is computed from a stored
  `startedAt` timestamp rather than a simple decrementing counter, so
  refreshing the tab or briefly closing the browser doesn't give you extra
  time or lose time incorrectly.
