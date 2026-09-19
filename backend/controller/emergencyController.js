import EmergencyCall from "../model/emergencyCall.js";
import Facility from "../model/facility.js";

function suggestLevel(reportedCondition = "") {
  const text = reportedCondition.toLowerCase();
  const specialized = ["stroke", "heart attack", "cardiac arrest", "severe burn", "unconscious", "not breathing"];
  const tertiary = ["fracture", "heavy bleeding", "chest pain", "seizure", "accident", "trauma"];
  const secondary = ["high fever", "dehydration", "labor", "pregnancy"];

  if (specialized.some((f) => text.includes(f))) return "specialized";
  if (tertiary.some((f) => text.includes(f))) return "tertiary";
  if (secondary.some((f) => text.includes(f))) return "secondary";
  return "primary";
}

export const createEmergencyCall = async (req, res) => {
  const { callerName, callerPhone, location, reportedCondition, patientId } = req.body;
  if (!callerName || !callerPhone || !location || !reportedCondition) {
    return res.status(400).json({ error: "callerName, callerPhone, location and reportedCondition are required" });
  }

  const call = await EmergencyCall.create({
    patient: patientId || null,
    callerName,
    callerPhone,
    location,
    reportedCondition,
    suggestedLevel: suggestLevel(reportedCondition),
    handledBy: req.userId,
  });

  return res.status(201).json(call);
};

export const dispatchEmergencyCall = async (req, res) => {
  const { finalLevel, overrideReason, receivingFacilityId } = req.body;

  const call = await EmergencyCall.findById(req.params.id);
  if (!call) return res.status(404).json({ error: "Emergency call not found" });
  if (!receivingFacilityId) return res.status(400).json({ error: "receivingFacilityId is required" });

  const facility = await Facility.findById(receivingFacilityId);
  if (!facility) return res.status(404).json({ error: "Receiving facility not found" });

  const level = finalLevel || call.suggestedLevel;
  if (level !== call.suggestedLevel && !overrideReason) {
    return res.status(400).json({ error: "overrideReason is required when overriding the suggested level" });
  }

  call.finalLevel = level;
  call.overrideReason = level !== call.suggestedLevel ? overrideReason : "";
  call.receivingFacility = facility._id;
  call.status = "dispatched";
  await call.save();

  return res.status(200).json(call);
};

export const updateEmergencyCallStatus = async (req, res) => {
  const { status } = req.body;
  if (!["arrived", "closed"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  const call = await EmergencyCall.findById(req.params.id);
  if (!call) return res.status(404).json({ error: "Emergency call not found" });
  call.status = status;
  await call.save();
  return res.status(200).json(call);
};

export const getEmergencyCalls = async (req, res) => {
  const filter = {};
  if (req.userRole === "emergency_operator") filter.handledBy = req.userId;

  const calls = await EmergencyCall.find(filter)
    .populate("receivingFacility", "name level")
    .populate("handledBy", "name")
    .sort({ createdAt: -1 });

  return res.status(200).json(calls);
};