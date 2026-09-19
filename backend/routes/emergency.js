import express from "express";
import {
  createEmergencyCall,
  dispatchEmergencyCall,
  updateEmergencyCallStatus,
  getEmergencyCalls,
} from "../controller/emergencyController.js";
import checkToken from "../middlewares/checkToken.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

router.get("/", checkToken, getEmergencyCalls);
router.post("/", checkToken, checkRole("emergency_operator"), createEmergencyCall);
router.patch("/:id/dispatch", checkToken, checkRole("emergency_operator"), dispatchEmergencyCall);
router.patch("/:id/status", checkToken, checkRole("emergency_operator", "clinician"), updateEmergencyCallStatus);

export default router;
