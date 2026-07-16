import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: [
        "Verbal Ability",
        "Logical Reasoning",
        "Quantitative Aptitude",
        "Pseudocode & Programming Logic",
        "Networking, Security & Cloud",
        "Core CS Fundamentals",
      ],
      index: true,
    },
    question: { type: String, required: true },
    code: { type: String, default: null }, // optional pseudocode/code snippet
    options: {
      type: [String],
      required: true,
      validate: (v) => v.length >= 2,
    },
    correctIndex: { type: Number, required: true }, // index into options
    explanation: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    source: { type: String, default: "seed" }, // "seed" | "imported" | "manual"
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Question ||
  mongoose.model("Question", QuestionSchema);
