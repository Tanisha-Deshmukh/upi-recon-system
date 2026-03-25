import axios from "axios";
import { Transaction } from "../models/transaction.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Account } from "../models/account.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { resolveBankId } from "../utils/bankHelper.js";

// handling normal upi payments here
export const initiatePayment = AsyncHandler(async (req, res) => {
    const { amount, receiverUpi, note, senderAccountNumber, fastpayPin, requestId } = req.body;

    if (!amount || amount <= 0) throw new ApiError(400, "Invalid amount");
    if (!receiverUpi) throw new ApiError(400, "Receiver UPI ID is required");
    if (!fastpayPin) throw new ApiError(400, "FastPay PIN is required for this transaction.");

    // Verify PIN
    const isPinValid = await req.user.isPinCorrect(fastpayPin);
    if (!isPinValid) {
        throw new ApiError(401, "Invalid FastPay PIN. Transaction declined.");
    }

    if (receiverUpi === req.user.upiId) throw new ApiError(400, "Self-transfer is not allowed.");

    // Idempotency Check
    if (requestId) {
        const existingTx = await Transaction.findOne({ requestId });
        if (existingTx) {
            return res.status(200).json(
                new ApiResponse(200, {
                    txId: existingTx._id,
                    utr: existingTx.utr,
                    status: existingTx.status
                }, "Payment already processed (Idempotency trigger).")
            );
        }
    }

    // figure out which account the sender is using
    const senderQuery = senderAccountNumber
        ? { userId: req.user._id, accountNumber: senderAccountNumber }
        : { userId: req.user._id };
    const senderAccount = await Account.findOne(senderQuery);
    if (!senderAccount) throw new ApiError(404, "Your linked bank account was not found. Please link a bank first.");

    // Resolve bankId from mock bank using account number (most reliable method)
    if (!senderAccount.bankId) {
        senderAccount.bankId = await resolveBankId(senderAccount.accountNumber, senderAccount.ifscCode);
        if (senderAccount.bankId) await senderAccount.save({ validateBeforeSave: false });
    }

    if (!senderAccount.bankId) {
        throw new ApiError(400, "Could not resolve your bank account in the Mock Bank. Please ensure the account exists there.");
    }

    // Identify Receiver
    const receiver = await User.findOne({ upiId: receiverUpi });
    if (!receiver) throw new ApiError(404, `No FastPay user found with UPI ID: ${receiverUpi}`);

    const receiverAccount = await Account.findOne({ userId: receiver._id });
    if (!receiverAccount) throw new ApiError(404, "Receiver has no linked bank account.");

    // Resolve receiver bankId too
    if (!receiverAccount.bankId) {
        receiverAccount.bankId = await resolveBankId(receiverAccount.accountNumber, receiverAccount.ifscCode);
        if (receiverAccount.bankId) await receiverAccount.save({ validateBeforeSave: false });
    }

    // gotta check balance before debiting lol
    if (senderAccount.balance < Number(amount)) {
        throw new ApiError(400, "Insufficient funds in your linked bank account.");
    }

    // Create PENDING transaction record
    const txRecord = await Transaction.create({
        senderId: req.user._id,
        receiverId: receiver._id,
        amount,
        senderAccount: senderAccount.accountNumber,
        receiverUpi,
        status: "PENDING",
        utr: `TEMP${Date.now()}`,
        requestId: requestId || `req-${Date.now()}-${Math.random()}`,
        note: note || "UPI Transfer"
    });

    try {
        // Debit sender's bank account
        const bankResponse = await axios.post(`${process.env.BANK_API_URL}/debit`, {
            bankId: senderAccount.bankId,
            accountNumber: senderAccount.accountNumber,
            amount,
            upiId: receiverUpi
        }, { timeout: 10000 });


        if (bankResponse.data && bankResponse.data.success) {
            // Also credit receiver's bank account (if they're in the same mock bank system)
            try {
                if (receiverAccount.bankId) {
                    await axios.post(`${process.env.BANK_API_URL}/credit`, {
                        bankId: receiverAccount.bankId,
                        accountNumber: receiverAccount.accountNumber,
                        amount,
                        upiId: req.user.upiId
                    }, { timeout: 10000 });
                }
            } catch (creditErr) {
                console.warn("credit failed but its fine for now:", creditErr.message);
            }

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                txRecord.status = "SUCCESS";
                txRecord.utr = bankResponse.data.utr;
                await txRecord.save({ session });

                // Sync balances in local DB
                senderAccount.balance -= Number(amount);
                receiverAccount.balance += Number(amount);

                await senderAccount.save({ session });
                await receiverAccount.save({ session });

                await session.commitTransaction();
                session.endSession();

                return res.status(200).json(
                    new ApiResponse(200, {
                        txId: txRecord._id,
                        utr: txRecord.utr,
                        amount,
                        receiver: receiver.fullName,
                        receiverUpi
                    }, `✅ ₹${amount} sent to ${receiver.fullName} (${receiverUpi})`)
                );
            } catch (dbError) {
                await session.abortTransaction();
                session.endSession();
                throw dbError;
            }
        }
    } catch (err) {
        const isNetworkError = !err.response || err.response.status === 503 || err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED';

        if (isNetworkError) {
            return res.status(503).json(
                new ApiResponse(503, { txId: txRecord._id }, "Bank server unreachable. Payment will be auto-reconciled shortly.")
            );
        }

        txRecord.status = "FAILED";
        await txRecord.save();
        throw new ApiError(400, err.response?.data?.message || "Bank rejected this transaction.");
    }
});

// internal wallet transfer (no bank req)
export const processPeerTransfer = AsyncHandler(async (req, res) => {
    const { senderAccountNumber, receiverAccountNumber, amount, receiverUpiId } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const senderAccount = await Account.findOne({ accountNumber: senderAccountNumber }).session(session);
        if (!senderAccount || senderAccount.balance < amount) {
            throw new Error("Insufficient funds or invalid sender account");
        }

        const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber }).session(session);
        if (!receiverAccount) throw new Error("Receiver account not found");

        senderAccount.balance -= Number(amount);
        receiverAccount.balance += Number(amount);

        await senderAccount.save({ session });
        await receiverAccount.save({ session });

        const transaction = await Transaction.create([{
            senderAccount: senderAccount.accountNumber,
            receiverAccount: receiverAccount.accountNumber,
            senderId: senderAccount.userId,
            receiverUpi: receiverUpiId || "internal-user",
            amount,
            status: "SUCCESS",
            description: `Internal Transfer from ${senderAccount.bankName}`
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(
            new ApiResponse(200, transaction[0], "Internal transfer completed successfully")
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: error.message });
    }
});

// --- 3. UTILITIES (History & Linking) ---
export const linkBankAccount = AsyncHandler(async (req, res) => {
    const { bankName, accountNumber, ifscCode } = req.body;

    // 1. Check if the account is already linked in the UPI database
    const existing = await Account.findOne({ accountNumber });
    if (existing) throw new ApiError(409, "This account is already linked.");

    try {
        // 2. Verify with the Mock Bank and fetch the REAL balance
        // This hits the http://localhost:8001/api/v1/bank/verify route
        const bankVerifyUrl = `${process.env.BANK_API_URL}/verify`; 
        
        const verifyResponse = await axios.post(bankVerifyUrl, {
            accountNumber: accountNumber,
            ifsc: ifscCode
        });

        if (verifyResponse.data && verifyResponse.data.success) {
            // 3. Extract the real balance from the bank's response
            const realBalance = verifyResponse.data.balance;

            // 4. Save the account to our UPI database with the real balance
            const newAccount = await Account.create({
                userId: req.user._id,
                bankName,
                accountNumber,
                ifscCode,
                balance: realBalance, // 🔴 Real balance applied here!
                isPrimary: true
            });

            return res.status(201).json(
                new ApiResponse(201, newAccount, "Bank account linked successfully!")
            );
        }
    } catch (error) {
        // If the bank returns a 404 (Account not found) or the server is down
        const errorMessage = error.response?.data?.message || "Failed to verify account with the bank. Please check your details.";
        throw new ApiError(400, errorMessage);
    }
});

export const getAllTransactions = AsyncHandler(async (req, res) => {
    const transactions = await Transaction.find({
        $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id }
        ]
    })
    .populate("senderId", "fullName email upiId")
    .populate("receiverId", "fullName email upiId")
    .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, transactions, "History retrieved successfully")
    );
});

// recon stuff

export const getPendingTransactions = AsyncHandler(async (req, res) => {
    // Find only PENDING transactions and populate receiver details for the bridge
    const pendingTxns = await Transaction.find({ status: "PENDING" })
        .populate("senderId", "fullName email")
        .populate("receiverId", "fullName email upiId");
    return res.status(200).json(new ApiResponse(200, pendingTxns, "Found pending transactions"));
});

export const updateTransactionFromRecon = AsyncHandler(async (req, res) => {
    const { txnId, status, utr } = req.body;
    if (!txnId || !status) throw new ApiError(400, "TxnId and Status are required");
    const txn = await Transaction.findById(txnId);
    if (!txn) throw new ApiError(404, "Transaction not found");
    if (txn.status !== "PENDING") return res.status(200).json(new ApiResponse(200, txn, "Already processed"));
    
    txn.status = status;
    if (utr) txn.utr = utr;

    try {
        await txn.save();
        console.log(`✅ [Recon Bridge] Updated Txn ${txnId} to ${status}`);
    } catch (saveErr) {
        if (saveErr.code === 11000) {
            console.warn(`⚠️ [Recon Bridge] UTR collision. Marking SUCCESS anyway for ${txnId}.`);
            await Transaction.findByIdAndUpdate(txnId, { status: "SUCCESS" });
        } else {
            throw saveErr;
        }
    }
    
    return res.status(200).json(new ApiResponse(200, txn, "Transaction status updated"));
});