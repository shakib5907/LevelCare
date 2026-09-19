import express from "express";
import { createReferral, getReferrals, decideReferral } from "../controller/referralController.js";
import checkToken from "../middlewares/checkToken.js";
import { checkRole } from "../middlewares/checkRole.js";
import { upload } from "../middlewares/multer.js";
import { multerErrorHandling } from "../middlewares/multerError.js";

const router = express.Router();

router.get("/", checkToken, getReferrals);
router.post(
  "/",
  checkToken,
  checkRole("gp", "clinician"),
  upload.single("supportingDocument"),
  multerErrorHandling,
  createReferral,
);
router.patch("/:id/decision", checkToken, checkRole("gp", "clinician"), decideReferral);

export default router;