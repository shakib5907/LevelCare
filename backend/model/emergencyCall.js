import { Schema, model } from "mongoose";

const emergencyCallSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", default: null },
    callerName: { type: Schema.Types.String, required: true },
    callerPhone: { type: Schema.Types.String, required: true },
    location: { type: Schema.Types.String, required: true },
    reportedCondition: { type: Schema.Types.String, required: true },

    suggestedLevel: {
      type: Schema.Types.String,
      enum: ["primary", "secondary", "tertiary", "specialized"],
      required: true,
    },
    finalLevel: {
      type: Schema.Types.String,
      enum: ["primary", "secondary", "tertiary", "specialized"],
      default: null,
    },
    overrideReason: Schema.Types.String,

    receivingFacility: { type: Schema.Types.ObjectId, ref: "Facility", default: null },
    handledBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: Schema.Types.String,
      enum: ["intake", "dispatched", "arrived", "closed"],
      default: "intake",
    },
  },
  { timestamps: true },
);

const EmergencyCall = model("EmergencyCall", emergencyCallSchema);
export default EmergencyCall;
