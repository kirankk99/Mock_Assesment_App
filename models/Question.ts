import mongoose, { Schema, type Document, type Model } from "mongoose";

export const QUESTION_SECTIONS = [
  "Verbal Ability",
  "Logical Reasoning",
  "Quantitative Aptitude",
  "Pseudocode & Programming Logic",
  "Networking, Security & Cloud",
  "Core CS Fundamentals",
  "JavaScript & TypeScript",
  "React & Redux",
  "Node.js & Express",
  "Advanced React & State Management",
  "Systems & Network Engineering",
  "Database Engineering",
  "Algorithmic Complexity & Performance",
] as const;

export type QuestionSection = (typeof QUESTION_SECTIONS)[number];
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionSource = "seed" | "imported" | "manual";

export interface QuestionDocument extends Document {
  section: QuestionSection;
  question: string;
  code: string | null;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuestionDifficulty;
  source: QuestionSource;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<QuestionDocument>(
  {
    section: {
      type: String,
      required: true,
      enum: QUESTION_SECTIONS,
      index: true,
    },
    question: { type: String, required: true },
    code: { type: String, default: null }, // optional pseudocode/code snippet
    options: {
      type: [String],
      required: true,
      validate: (v: string[]) => v.length >= 2,
    },
    correctIndex: { type: Number, required: true }, // index into options
    explanation: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    source: { type: String, default: "seed" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Question: Model<QuestionDocument> =
  mongoose.models.Question || mongoose.model<QuestionDocument>("Question", QuestionSchema);

export default Question;
