import Facility from "../model/facility.js";

export const getFacilities = async (req, res) => {
  const { district, upazila, level, specialty, q } = req.query;
  const filter = {};
  if (district) filter.district = district;
  if (upazila) filter.upazila = upazila;
  if (level) filter.level = level;
  if (specialty) filter.specialties = specialty;
  if (q) filter.name = { $regex: q, $options: "i" };

  const facilities = await Facility.find(filter).sort({ level: 1, name: 1 });
  return res.status(200).json(facilities);
};

export const getFacilityById = async (req, res) => {
  const facility = await Facility.findById(req.params.id);
  if (!facility) return res.status(404).json({ error: "Facility not found" });
  return res.status(200).json(facility);
};


export const createFacility = async (req, res) => {
  try {
    const facility = await Facility.create(req.body);
    return res.status(201).json(facility);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};