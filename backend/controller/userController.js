import { hashPassword } from "../utils/helpers.js";
import User, { ROLES } from "../model/user.js";

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
    district, upazila, isImmobile, facilityName, specialty,
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