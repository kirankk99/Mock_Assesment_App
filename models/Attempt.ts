import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type AttemptStatus = "in_progress" | "completed" | "aborted";

export interface SnapshotQuestion {
  questionId: Types.ObjectId;
  section: string;
  question: string;
  code: string | null;
  options: string[]; // already shuffled for this attempt
  correctIndex: number; // index into the shuffled options above
  explanation: string;
}

export interface AttemptDocument extends Document {
  questions: SnapshotQuestion[];
  durationSeconds: number;
  status: AttemptStatus;
  answers: (number | null)[];
  score: number | null;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Each attempt stores a frozen snapshot of the 30 questions it was built from,
// including the shuffled option order and the correct index WITHIN that shuffled
// order. This is what makes grading trustworthy on the server: the client only
// ever receives question text + shuffled options, never the answer key, until
// it submits.
const SnapshotQuestionSchema = new Schema<SnapshotQuestion>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question" },
    section: String,
    question: String,
    code: String,
    options: [String],
    correctIndex: Number,
    explanation: String,
  },
  { _id: false }
);

const AttemptSchema = new Schema<AttemptDocument>(
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

const Attempt: Model<AttemptDocument> =
  mongoose.models.Attempt || mongoose.model<AttemptDocument>("Attempt", AttemptSchema);

export default Attempt;
