import express from "express";
import checkToken from "../middlewares/checkToken.js";
import { checkRole } from "../middlewares/checkRole.js";
import {
  getProfile,
  createUser,
  getPendingStaff,
  verifyStaff,
  getAnalytics,
} from "../controller/userController.js";

const router = express.Router();

router.get("/profile", checkToken, getProfile);
router.post("/", createUser);

// Admin only
router.get("/staff/pending", checkToken, checkRole("admin"), getPendingStaff);
router.patch("/staff/:id/verify", checkToken, checkRole("admin"), verifyStaff);
router.get("/analytics", checkToken, checkRole("admin"), getAnalytics);

export default router;