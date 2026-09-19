import express from "express";
import userRoutes from "./routes/users.js";
import authRouter from "./routes/auth.js";
import facilityRoutes from "./routes/facilities.js";
import referralRoutes from "./routes/referrals.js";
import appointmentRoutes from "./routes/appointments.js";
import emergencyRoutes from "./routes/emergency.js";
import log from "./middlewares/logger.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 4000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to database");
  } catch (err) {
    console.log(`Error connecting to database ${err}`);
    process.exit(1);
  }
};

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Temp holding folder for uploads before they're pushed to Cloudinary
const uploadDir = process.env.ENV === "development" ? "uploads" : "/tmp/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.ALLOWED_ORIGIN,
  }),
);
app.use(log);

app.get("/api", (req, res) => res.json({ message: "LevelCare API is working" }));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRouter);
app.use("/api/facilities", facilityRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/emergency", emergencyRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

export default app;