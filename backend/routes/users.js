import express from "express";
import checkToken from "../middlewares/checkToken.js";
import { getProfile, createUser } from "../controller/userController.js";

const router = express.Router();

router.get("/profile", checkToken, getProfile);
router.post("/", createUser);

export default router;