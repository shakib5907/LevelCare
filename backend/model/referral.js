import { Schema, model } from "mongoose";

const documentSchema = new Schema({ url: String, publicId: String }, { _id: false });

const referralSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuingFacilityName: { type: Schema.Types.String, required: true },

    targetLevel: {
      type: Schema.Types.String,
      enum: ["secondary", "tertiary", "specialized"],
      required: true,
    },
    requiredSpecialty: Schema.Types.String,
    reason: { type: Schema.Types.String, required: true },
    clinicalSummary: Schema.Types.String,
    urgency: { type: Schema.Types.String, enum: ["routine", "urgent"], default: "routine" },

    
    supportingDocument: documentSchema,

    status: {
      type: Schema.Types.String,
      enum: ["issued", "used", "expired", "declined"],
      default: "issued",
    },
    declineReason: Schema.Types.String,

    validUntil: { type: Schema.Types.Date, required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    usedByAppointment: { type: Schema.Types.ObjectId, ref: "Appointment", default: null },
  },
  { timestamps: true },
);

const Referral = model("Referral", referralSchema);
export default Referral;