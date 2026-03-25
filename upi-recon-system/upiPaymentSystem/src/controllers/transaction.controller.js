import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import crypto from "crypto";

const initiateTransfer = AsyncHandler(async (req, res) => {
    const { receiverUpiId, amount } = req.body;
    const senderUpiId = req.user.upiId;

    if (!receiverUpiId || !amount || amount <= 0) {
        throw new ApiError(400, "Valid receiver UPI ID and amount are required");
    }

    if (senderUpiId === receiverUpiId) {
        throw new ApiError(400, "You cannot send money to yourself");
    }

    const receiver = await User.findOne({ upiId: receiverUpiId });
    if (!receiver) {
        throw new ApiError(404, "Receiver not found");
    }

    // Generate a unique transaction ID (like a real bank UTR)
    const transactionId = `TXN${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

    // Create the PENDING transaction
    const newTxn = await Transaction.create({
        transactionId,
        senderUpiId,
        receiverUpiId,
        amount,
        status: "PENDING"
    });

    // In a real system, you'd call the Bank API right here to process it.
    // For now, we leave it PENDING so your Cron job can pick it up!

    return res.status(200).json(
        new ApiResponse(200, newTxn, "Transfer initiated and is currently PENDING")
    );
});

export { initiateTransfer };