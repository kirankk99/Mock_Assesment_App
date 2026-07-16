import mongoose from "mongoose";

// Each attempt stores a frozen snapshot of the 30 questions it was built from,
// including the shuffled option order and the correct index WITHIN that shuffled
// order. This is what makes grading trustworthy on the server: the client only
// ever receives question text + shuffled options, never the answer key, until
// it submits.
const SnapshotQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    section: String,
    question: String,
    code: String,
    options: [String], // already shuffled for this attempt
    correctIndex: Number, // index into the shuffled options above
    explanation: String,
  },
  { _id: false }
);

const AttemptSchema = new mongoose.Schema(
  {
    questions: { type: [SnapshotQuestionSchema], required: true },
    durationSeconds: { type: Number, default: 60 * 60 },
    status: {
      type: String,
      enum: ["in_progress", "completed", "aborted"],
      default: "in_progress",
    },
    answers: { type: [Number], default: [] }, // answers[i] = chosen option index or null
    score: { type: Number, default: null },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Attempt ||
  mongoose.model("Attempt", AttemptSchema);
