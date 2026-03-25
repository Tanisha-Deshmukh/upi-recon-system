import { Router } from "express";
import { sendOTP, registerUser, loginUser, getTxnStatus } from "../controllers/reco.controller.js";

const router = Router();

// Auth Routes
router.route("/send-otp").post(sendOTP);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Transaction Routes
router.route("/status/:transactionId").get(getTxnStatus);

export default router;