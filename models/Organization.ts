import mongoose, { Schema, type Document, type Model } from "mongoose";

export type OrgStatus = "Pending" | "Approved" | "Rejected" | "Suspended";

export interface OrganizationDocument extends Document {
  orgName: string;
  // Derived from orgName (see lib/slug.ts). Used as the org's identifier in
  // URLs; the org's Mongo _id remains the real foreign key everywhere else.
  orgSlug: string;
  status: OrgStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<OrganizationDocument>(
  {
    orgName: { type: String, required: true, trim: true },
    orgSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Suspended"],
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true }
);

const Organization: Model<OrganizationDocument> =
  mongoose.models.Organization ||
  mongoose.model<OrganizationDocument>("Organization", OrganizationSchema);

export default Organization;
