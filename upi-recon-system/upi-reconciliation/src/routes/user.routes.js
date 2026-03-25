import { Router } from "express";
import {
    sendOTP,
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    linkBankAccount,
    getUserAccounts, // ✅ Added this
    activateFastPay,
    getAllContacts,
    getTransactionHistory,
    savePushSubscription,
    validateSession
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();
router.route("/contacts").get(verifyJWT, getAllContacts);
router.route("/send-otp").post(sendOTP);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/validate").get(verifyJWT, validateSession);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/accounts").get(verifyJWT, getUserAccounts);
// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/link-bank").post(verifyJWT, linkBankAccount); // ✅ Added this route
router.route("/activate-fastpay").post(verifyJWT, activateFastPay);
router.route("/payments/history").get(verifyJWT, getTransactionHistory); // ✅ Added for Dashboard
router.route("/subscribe-push").post(verifyJWT, savePushSubscription);

export default router;
