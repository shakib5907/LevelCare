import Appointment from "../model/appointment.js";
import Referral from "../model/referral.js";
import Facility from "../model/facility.js";

async function nextToken(facilityId, level) {
  const count = await Appointment.countDocuments({ facility: facilityId });
  const prefix = level.slice(0, 3).toUpperCase();
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

export const createAppointment = async (req, res) => {
  const { facilityId, scheduledAt, referralId } = req.body;

  try {
    if (!facilityId || !scheduledAt) {
      return res.status(400).json({ error: "facilityId and scheduledAt are required" });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ error: "Facility not found" });

    let referral = null;
    if (facility.level !== "primary") {
      if (!referralId) {
        return res.status(403).json({
          error: `Booking at ${facility.level} level requires a valid referral.`,
        });
      }
      referral = await Referral.findById(referralId);
      if (!referral) return res.status(404).json({ error: "Referral not found" });
      if (String(referral.patient) !== String(req.userId)) {
        return res.status(403).json({ error: "This referral does not belong to you" });
      }
      if (referral.targetLevel !== facility.level) {
        return res.status(400).json({ error: `Referral targets ${referral.targetLevel}, not ${facility.level}` });
      }
      if (referral.status !== "issued" || referral.validUntil.getTime() < Date.now()) {
        if (referral.status === "issued") {
          referral.status = "expired";
          await referral.save();
        }
        return res.status(403).json({ error: `Referral is not usable (status: ${referral.status})` });
      }
    }

    const token = await nextToken(facility._id, facility.level);

    const appointment = await Appointment.create({
      patient: req.userId,
      facility: facility._id,
      level: facility.level,
      referral: referral ? referral._id : null,
      scheduledAt,
      token,
    });

    if (referral) {
      referral.status = "used";
      referral.usedByAppointment = appointment._id;
      await referral.save();
    }

    return res.status(201).json(appointment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAppointments = async (req, res) => {
  const filter = {};
  if (req.userRole === "patient") {
    filter.patient = req.userId;
  }


  const appointments = await Appointment.find(filter)
    .populate("patient", "name phone")
    .populate("facility", "name level district upazila")
    .populate("referral")
    .sort({ scheduledAt: -1 });

  return res.status(200).json(appointments);
};

export const rescheduleAppointment = async (req, res) => {
  const { scheduledAt } = req.body;
  if (!scheduledAt) return res.status(400).json({ error: "scheduledAt is required" });

  const appt = await Appointment.findOne({ _id: req.params.id, patient: req.userId });
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  if (["completed", "cancelled"].includes(appt.status)) {
    return res.status(400).json({ error: `Cannot reschedule a ${appt.status} appointment` });
  }

  appt.scheduledAt = scheduledAt;
  await appt.save();
  return res.status(200).json(appt);
};

export const cancelAppointment = async (req, res) => {
  const appt = await Appointment.findOne({ _id: req.params.id, patient: req.userId });
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  appt.status = "cancelled";
  await appt.save();
  return res.status(200).json(appt);
};

export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;
  if (!["started", "completed", "no_show"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  appt.status = status;
  await appt.save();
  return res.status(200).json(appt);
};