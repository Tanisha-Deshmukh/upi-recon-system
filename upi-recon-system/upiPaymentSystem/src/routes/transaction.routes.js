import { Router } from "express";
import { initiateTransfer } from "../controllers/transaction.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// User must be logged in to send money
router.route("/send").post(verifyJWT, initiateTransfer);

export default router;