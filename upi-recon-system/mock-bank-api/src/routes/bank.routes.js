import { Router } from "express";
import { processCredit, processDebit, getStatement, checkStatus, createAccount, createBank,getAllBanks, verifyAccount, getAccountByNumber} from "../controllers/bank.controller.js";

const router = Router();
router.route("/debit").post(processDebit);
router.route("/credit").post(processCredit);
router.get("/statement/:accountNumber", getStatement);
router.get("/account-details/:accountNumber", getAccountByNumber);
router.get("/status/:account/:amount", checkStatus);   //route your Reconciliation Cron Job is looking for//Path: http://localhost:5000/api/v1/bank/status/:account/:amount
router.route("/master-bank/create").post(createBank);
router.route("/account/create").post(createAccount);
router.route("/list").get(getAllBanks);
router.route("/verify").post(verifyAccount);

export default router;