import { Schema, model } from "mongoose";

export const LEVELS = ["primary", "secondary", "tertiary", "specialized"];

const facilitySchema = new Schema(
  {
    name: { type: Schema.Types.String, required: true },
    level: { type: Schema.Types.String, enum: LEVELS, required: true },
    district: { type: Schema.Types.String, required: true },
    upazila: { type: Schema.Types.String, required: true },
    specialties: [Schema.Types.String],
    address: Schema.Types.String,
    contactPhone: Schema.Types.String,
  },
  { timestamps: true },
);

const Facility = model("Facility", facilitySchema);
export default Facility;