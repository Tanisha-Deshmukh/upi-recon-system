import { Router } from "express";
// Import your controller here once you build the payment logic
// import { initiatePayment } from "../controllers/upi.controller.js";

const router = Router();

// Placeholder route for creating a payment
router.post("/pay", (req, res) => {
    res.status(200).json({ message: "UPI Payment Route is working!" });
});

export default router;