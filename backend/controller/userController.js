import { hashPassword } from "../utils/helpers.js";
import User, { ROLES } from "../model/user.js";
import Referral from "../model/referral.js";
import Appointment from "../model/appointment.js";
import EmergencyCall from "../model/emergencyCall.js";

export const getProfile = async (req, res) => {
  try {
    const userInfo = await User.findById(req.userId).select(["-__v", "-password"]);
    return res.status(200).json(userInfo);
  } catch (err) {
    return res.status(400).json(err);
  }
};

export const createUser = async (req, res) => {
  const {
    name, email, phone, password, role = "patient",
    district, upazila, isImmobile, facilityName, facilityLevel, specialty,
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  if (role === "admin") {
    return res.status(403).json({ error: "Admin accounts cannot be self-registered" });
  }
  if (role !== "patient" && role !== "emergency_operator" && !facilityLevel) {
    return res.status(400).json({ error: "facilityLevel is required for clinical staff" });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    name,
    email: email.toLowerCase(),
    phone,
    password: hashedPassword,
    role,
    district: role === "patient" ? district : undefined,
    upazila: role === "patient" ? upazila : undefined,
    isImmobile: role === "patient" ? !!isImmobile : undefined,
    facilityName: role !== "patient" ? facilityName : undefined,
    facilityLevel: role === "gp" ? "primary" : role !== "patient" ? facilityLevel : undefined,
    specialty: role !== "patient" ? specialty : undefined,
  });

  try {
    const existing = await User.findOne({ email: email.toLowerCase() }).select(["email"]);

    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }
    await newUser.save();

    return res.status(201).json({
      message:
        role === "patient"
          ? "Registration successful. You can now log in."
          : "Registered. Your account needs administrator verification before you can act on referrals or appointments.",
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};

// ---- Admin only (gated by checkRole("admin") in routes/users.js) ----

export const getPendingStaff = async (req, res) => {
  const staff = await User.find({ role: { $ne: "patient" }, isVerified: false }).select([
    "-__v",
    "-password",
  ]);
  return res.status(200).json(staff);
};

export const verifyStaff = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.role === "patient") return res.status(400).json({ error: "Patients do not require verification" });
  user.isVerified = true;
  await user.save();
  return res.status(200).json({ message: "Staff account verified" });
};

// Headline analytics: referral compliance rate is the % of tertiary/specialized
// appointments that arrived with a valid referral attached.
export const getAnalytics = async (req, res) => {
  const [primaryVisits, secondaryVisits] = await Promise.all([
    Appointment.countDocuments({ level: "primary" }),
    Appointment.countDocuments({ level: "secondary" }),
  ]);

  const higherLevelAppointments = await Appointment.countDocuments({
    level: { $in: ["tertiary", "specialized"] },
  });
  const higherLevelWithReferral = await Appointment.countDocuments({
    level: { $in: ["tertiary", "specialized"] },
    referral: { $ne: null },
  });
  const referralComplianceRate =
    higherLevelAppointments === 0
      ? null
      : Number(((higherLevelWithReferral / higherLevelAppointments) * 100).toFixed(1));

  const totalAppointments = await Appointment.countDocuments({});
  const emergencyDispatches = await EmergencyCall.countDocuments({ status: { $ne: "intake" } });
  const emergencyBypassShare =
    totalAppointments + emergencyDispatches === 0
      ? null
      : Number(((emergencyDispatches / (totalAppointments + emergencyDispatches)) * 100).toFixed(1));

  const declinedByIssuer = await Referral.aggregate([
    { $match: { status: "declined" } },
    { $group: { _id: "$issuingFacilityName", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return res.status(200).json({
    primaryVisits,
    secondaryVisits,
    referralComplianceRate,
    emergencyDispatches,
    emergencyBypassShare,
    declinedByIssuer,
  });
};