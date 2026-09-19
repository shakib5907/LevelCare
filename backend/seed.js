import mongoose from "mongoose";
import "dotenv/config";
import { hashPassword } from "./utils/helpers.js";
import User from "./model/user.js";
import Facility from "./model/facility.js";

const ADMIN_EMAIL = "admin@levelcare.local";
const ADMIN_PASSWORD = "password123";

const FACILITIES = [
  {
    name: "Mirpur Community Clinic",
    level: "primary",
    district: "Dhaka",
    upazila: "Mirpur",
    specialties: ["general medicine"],
  },
  {
    name: "Savar Upazila Health Complex",
    level: "secondary",
    district: "Dhaka",
    upazila: "Savar",
    specialties: ["general surgery", "gynecology", "internal medicine"],
  },
  {
    name: "Dhaka Medical College Hospital",
    level: "tertiary",
    district: "Dhaka",
    upazila: "Dhaka",
    specialties: ["cardiology", "orthopedics", "neurology"],
  },
  {
    name: "National Institute of Cardiovascular Diseases",
    level: "specialized",
    district: "Dhaka",
    upazila: "Dhaka",
    specialties: ["cardiology"],
  },
];

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing - check your .env file.");
    process.exit(1);
  }

  await mongoose.connect(process.env.DATABASE_URL);
  console.log("Connected to database. Seeding...");

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);
    await User.create({
      name: "System Administrator",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });
    console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  for (const f of FACILITIES) {
    const existing = await Facility.findOne({ name: f.name });
    if (existing) {
      console.log(`Facility already exists: ${f.name}`);
    } else {
      await Facility.create(f);
      console.log(`Facility created: ${f.name} (${f.level})`);
    }
  }

  console.log("\nDone. Log in as the admin above to verify staff and manage facilities.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});