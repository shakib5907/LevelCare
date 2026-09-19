import express from "express";
import { getFacilities, getFacilityById, createFacility } from "../controller/facilityController.js";
import checkToken from "../middlewares/checkToken.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

router.get("/", checkToken, getFacilities);
router.get("/:id", checkToken, getFacilityById);
router.post("/", checkToken, checkRole("admin"), createFacility);

export default router;