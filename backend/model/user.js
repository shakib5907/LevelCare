import { Schema, model } from "mongoose";

export const ROLES = [
  "patient",
  "gp",
  "clinician",
  "paramedic",
  "emergency_operator",
  "admin",
];

const userSchema = new Schema(
  {
    name: { type: Schema.Types.String, required: true },
    email: { type: Schema.Types.String, required: true, unique: true, lowercase: true, trim: true },
    phone: Schema.Types.String,
    password: { type: Schema.Types.String, required: true },
    role: { type: Schema.Types.String, enum: ROLES, required: true, default: "patient" },

    facilityName: Schema.Types.String,
    specialty: Schema.Types.String,
    isVerified: {
      type: Schema.Types.Boolean,
      default: function () {
        return this.role === "patient";
      },
    },

    district: Schema.Types.String,
    upazila: Schema.Types.String,
    isImmobile: { type: Schema.Types.Boolean, default: false },
  },
  { timestamps: true },
);

const User = model("User", userSchema);
export default User;