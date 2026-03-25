import { Router } from "express";
import { 
    initiatePayment, 
    getAllTransactions, 
    processPeerTransfer, 
    getPendingTransactions, 
    updateTransactionFromRecon 
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// hitting POST /send
router.route("/send").post(verifyJWT, initiatePayment);
router.route("/history").get(verifyJWT, getAllTransactions);
router.route("/transfer").post(processPeerTransfer);

// internal recon routes, don't expose
router.route("/recon/pending").get(getPendingTransactions);
router.route("/recon/update").post(updateTransactionFromRecon);

export default router;