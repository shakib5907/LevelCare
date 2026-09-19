import { v2 as cloudinary } from "cloudinary";
import Referral from "../model/referral.js";
import User from "../model/user.js";
import { deleteFiles } from "../utils/deleteFiles.js";

const ORDER = ["primary", "secondary", "tertiary", "specialized"];

// Issue a referral. Any verified clinician may issue one, so long as the
// target level is above their own facility's level. A supporting document
// (lab report, imaging, etc.) is optional and, if attached, is uploaded to
// Cloudinary the same way the reference file-upload example handles images.
export const createReferral = async (req, res) => {
  const {
    patientId,
    targetLevel,
    requiredSpecialty,
    reason,
    clinicalSummary,
    urgency,
    validDays = 30,
  } = req.body;
  const file = req.file; // set by multer if a document was attached

  try {
    if (!patientId || !targetLevel || !reason) {
      return res.status(400).json({ error: "patientId, targetLevel and reason are required" });
    }
    if (!ORDER.includes(targetLevel) || targetLevel === "primary") {
      return res.status(400).json({ error: "Invalid targetLevel" });
    }

    const patient = await User.findOne({ _id: patientId, role: "patient" });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const issuer = await User.findById(req.userId);
    const issuerLevel = issuer.facilityLevel || "primary";
    const issuerRank = ORDER.indexOf(issuerLevel);
    const targetRank = ORDER.indexOf(targetLevel);
    if (targetRank <= issuerRank) {
      return res.status(400).json({
        error: `A referral must move the patient to a level higher than your own (${issuerLevel}).`,
      });
    }

    let supportingDocument;
    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "referral_documents",
        resource_type: "auto", // allows PDFs as well as images
      });
      supportingDocument = { url: result.secure_url, publicId: result.public_id };
    }

    const validUntil = new Date(Date.now() + Number(validDays) * 24 * 60 * 60 * 1000);

    const referral = await Referral.create({
      patient: patient._id,
      issuedBy: issuer._id,
      issuingFacilityName: issuer.facilityName || "Unknown facility",
      targetLevel,
      requiredSpecialty,
      reason,
      clinicalSummary,
      urgency: urgency === "urgent" ? "urgent" : "routine",
      supportingDocument,
      validUntil,
    });

    return res.status(201).json(referral);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (file) deleteFiles([file.path]);
  }
};

// List referrals - scoped by role
export const getReferrals = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  if (req.userRole === "patient") {
    filter.patient = req.userId;
  } else if (["gp", "clinician"].includes(req.userRole)) {
    // Clinicians see referrals they issued, plus incoming referrals
    // targeted at their own facility level (optionally narrowed by
    // the ?status= query param above).
    const issuer = await User.findById(req.userId);
    filter.$or = [
      { issuedBy: req.userId },
      { targetLevel: issuer.facilityLevel },
    ];
  }
  // admin sees everything

  const referrals = await Referral.find(filter)
    .populate("patient", "name email phone")
    .populate("issuedBy", "name role")
    .sort({ createdAt: -1 });

  return res.status(200).json(referrals);
};

// Receiving-level clinician accepts or declines a referral
export const decideReferral = async (req, res) => {
  const { decision, declineReason } = req.body; // 'accept' | 'decline'
  if (!["accept", "decline"].includes(decision)) {
    return res.status(400).json({ error: "decision must be 'accept' or 'decline'" });
  }

  const referral = await Referral.findById(req.params.id);
  if (!referral) return res.status(404).json({ error: "Referral not found" });
  if (referral.status !== "issued") {
    return res.status(400).json({ error: `Referral already ${referral.status}` });
  }

  if (decision === "decline") {
    if (!declineReason) return res.status(400).json({ error: "declineReason is required to decline" });
    referral.status = "declined";
    referral.declineReason = declineReason;
  } else {
    referral.status = "accepted";
  }
  referral.reviewedBy = req.userId;
  await referral.save();

  return res.status(200).json(referral);
};