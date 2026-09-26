import express from "express";
import {
  createAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
} from "../controller/appointmentController.js";
import checkToken from "../middlewares/checkToken.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

router.get("/", checkToken, getAppointments);
router.post("/", checkToken, checkRole("patient"), createAppointment);
router.patch("/:id/reschedule", checkToken, checkRole("patient"), rescheduleAppointment);
router.patch("/:id/cancel", checkToken, checkRole("patient"), cancelAppointment);
router.patch("/:id/status", checkToken, checkRole("gp", "clinician"), updateAppointmentStatus);

export default router;