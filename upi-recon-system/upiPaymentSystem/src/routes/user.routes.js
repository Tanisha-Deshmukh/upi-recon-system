import { Router } from "express";
import { 
    sendUpiOtp, 
    registerUser, 
    loginUser, 
    logoutUser,
    linkBankAccount,
    getUserAccounts,
    activateFastPay,
    getAllContacts,
    updateUpiId,
    fastpaySignup,
    fastpayLogin
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// open routes
router.route("/send-otp").post(sendUpiOtp);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// logged in only
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/accounts").get(verifyJWT, getUserAccounts);
router.route("/link-bank").post(verifyJWT, linkBankAccount);
router.route("/activate-fastpay").post(verifyJWT, activateFastPay);
router.route("/contacts").get(verifyJWT, getAllContacts);
router.route("/upi-id").put(verifyJWT, updateUpiId);
router.route("/fastpay/signup").post(fastpaySignup);
router.route("/fastpay/login").post(fastpayLogin);

export default router;