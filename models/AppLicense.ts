import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface AppLicenseDocument extends Document {
  orgId: Types.ObjectId;
  licenseKey: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppLicenseSchema = new Schema<AppLicenseDocument>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    licenseKey: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AppLicense: Model<AppLicenseDocument> =
  mongoose.models.AppLicense ||
  mongoose.model<AppLicenseDocument>("AppLicense", AppLicenseSchema);

export default AppLicense;
