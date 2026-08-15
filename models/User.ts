import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type UserRole = "SUPER_ADMIN" | "ORG_ADMIN" | "CANDIDATE" | "GUEST";

export interface UserDocument extends Document {
  // null only for SUPER_ADMIN, which isn't tied to a tenant.
  orgId: Types.ObjectId | null;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  mustResetPassword: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    // Globally unique, not scoped per-org: one login is one account across
    // the whole platform for now (see plan doc for rationale).
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ORG_ADMIN", "CANDIDATE", "GUEST"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    mustResetPassword: { type: Boolean, default: false },
    avatarUrl: { type: String, default: null },
  },
  { timestamps: true }
);

const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

export default User;
