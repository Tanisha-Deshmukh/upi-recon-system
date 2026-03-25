import { BankAccount } from "../models/bankAccount.model.js";
import { Transaction } from "../models/transaction.model.js";
import { Bank } from "../models/bank.model.js";
import mongoose from "mongoose";

// 1. Process Debit (Sender's Side)
const createBank = async (req, res) => {
    try {
        const { name, shortName, ifscPrefix } = req.body;

        if (!name || !shortName || !ifscPrefix) {
            return res.status(400).json({ success: false, message: "All bank fields are required" });
        }

        const newBank = await Bank.create({ name, shortName, ifscPrefix });

        res.status(201).json({
            success: true,
            message: `${shortName} added successfully to the system`,
            bank: newBank
        });
    } catch (error) {
        // Handle duplicate names
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Bank already exists" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
// 1. Process Debit (Sender's Side) - UPDATED
const processDebit = async (req, res) => {
    // 1. We now look for bankId in the request body
    const { bankId, accountNumber, amount, upiId } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. The query is now specific to the bank and account number
        const account = await BankAccount.findOne({ bankId, accountNumber }).session(session);
        
        if (!account) throw new Error("Account not found within this bank");
        if (account.balance < amount) throw new Error("Insufficient Balance");

        // ... the rest of the deduction logic is the same ...
        account.balance -= Number(amount);
        await account.save({ session });

        const utr = "BANK" + Math.floor(1000000000 + Math.random() * 9000000000);
        
        // 3. We populate the Bank model to get the bank's short name for remarks
        const bank = await Bank.findById(bankId);
        
        await Transaction.create([{
            utrNumber: utr,
            accountNumber,
            type: "DEBIT",
            status: "SUCCESS",
            amount,
            upiId,
            remarks: `UPI Payment to ${upiId}`
        }], { session });

        await session.commitTransaction();

        res.status(200).json({ 
            success: true, 
            utr, 
            newBalance: account.balance 
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

// 🔴 THE RECONCILIATION LOOKUP (Essential for your project)
const checkStatus = async (req, res) => {
    // These names MUST match the colon-names in the router above
    const { account, amount } = req.params; 
    
    try {
        const record = await Transaction.findOne({ 
            accountNumber: account, 
            amount: Number(amount),
            type: "DEBIT"
        }).sort({ createdAt: -1 });

        if (record) {
            return res.status(200).json({ found: true, utr: record.utrNumber });
        }
        return res.status(404).json({ found: false }); // Bank says: "I don't see this money in my records yet"
    } catch (error) {
        res.status(500).json({ success: false, message: "Bank internal error" });
    }
};

// 2. Process Credit (Receiver's Side)
// 2. Process Credit (Receiver's Side) - UPDATED
const processCredit = async (req, res) => {
    // 1. We now look for bankId in the request body
    const { bankId, accountNumber, amount, upiId } = req.body;
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. The query is now specific to the bank and account number
        const account = await BankAccount.findOne({ bankId, accountNumber }).session(session);
        if (!account) throw new Error("Receiver account not found within this bank");

        // ... the rest of the money movement logic is the same ...
        account.balance += Number(amount);
        await account.save({ session });

        const utr = Math.floor(100000000000 + Math.random() * 900000000000).toString();

        await Transaction.create([{
            accountNumber,
            amount,
            type: "CREDIT",
            status: "SUCCESS",
            utrNumber: utr,
            upiId,
            remarks: `Received via UPI from ${upiId}`
        }], { session });

        await session.commitTransaction();
        res.status(200).json({ success: true, utr, newBalance: account.balance });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

// 3. Getting the Statement
const getStatement = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        // Find all transactions for this account, newest first
        const transactions = await Transaction.find({ accountNumber }).sort({ createdAt: -1 });

        if (transactions.length === 0) {
    return res.status(404).json({ success: false, message: "No transactions found" });
}

        res.status(200).json({
            success: true,
            accountNumber,
            transactions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Get Full Account Details
const getAccountByNumber = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const account = await BankAccount.findOne({ accountNumber }).populate('bankId');
        
        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found" });
        }
        
        res.status(200).json({ success: true, account });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Create a New Account via API
const createAccount = async (req, res) => {
    try {
        // We now expect bankId from your React frontend or Postman
        const { bankId, accountNumber, ifsc, phoneNumber, balance, holderName, pin } = req.body;

        if (!bankId || !accountNumber || !holderName || !pin) {
            return res.status(400).json({ success: false, message: "Required fields are missing" });
        }

        // Verify the bank actually exists in your database first
        const bankExists = await Bank.findById(bankId);
        if (!bankExists) {
            return res.status(404).json({ success: false, message: "Bank not found. Please provide a valid bankId." });
        }

        const newAccount = await BankAccount.create({
            bankId,
            accountNumber,
            ifsc: ifsc || `${bankExists.ifscPrefix}0001234`, // Auto-generate if not provided
            phoneNumber,
            balance: Number(balance) || 0,
            holderName,
            pin
        });

        res.status(201).json({ 
            success: true, 
            message: "Account created successfully", 
            account: newAccount 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllBanks = async (req, res) => {
    try {
        const banks = await Bank.find({});
        res.status(200).json({ success: true, banks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyAccount = async (req, res) => {
    try {
        const { accountNumber, ifsc } = req.body;
        const account = await BankAccount.findOne({ accountNumber, ifsc });

        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found in bank records." });
        }
        return res.status(200).json({ success: true, balance: account.balance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

let bankStatements = [];

export{checkStatus, processCredit, processDebit, getStatement, createBank, createAccount, getAllBanks, verifyAccount, getAccountByNumber}