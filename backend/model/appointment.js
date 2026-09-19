import { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    facility: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
    level: {
      type: Schema.Types.String,
      enum: ["primary", "secondary", "tertiary", "specialized"],
      required: true,
    },
    provider: { type: Schema.Types.ObjectId, ref: "User", default: null },
    referral: { type: Schema.Types.ObjectId, ref: "Referral", default: null },
    scheduledAt: { type: Schema.Types.Date, required: true },
    token: { type: Schema.Types.String, required: true },
    status: {
      type: Schema.Types.String,
      enum: ["booked", "cancelled", "started", "completed", "no_show"],
      default: "booked",
    },
    consultationNotes: Schema.Types.String,
  },
  { timestamps: true },
);

const Appointment = model("Appointment", appointmentSchema);
export default Appointment;