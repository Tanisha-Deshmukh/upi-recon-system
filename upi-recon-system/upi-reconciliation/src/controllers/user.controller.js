import { RecoUser } from "../models/recoUser.model.js";
import { Otp } from "../models/otp.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import { Transaction } from "../models/transaction.model.js";

// Helper for tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await RecoUser.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

// --- 1. Send OTP ---
const sendOTP = AsyncHandler(async (req, res) => {
    const { email, phoneNumber } = req.body;

    if (!email || !phoneNumber) throw new ApiError(400, "Email and Phone are required");

    const existingUser = await RecoUser.findOne({ email });
    if (existingUser) throw new ApiError(409, "User already registered");

    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({ email, phoneNumber, otp: otpValue });

    const emailBody = `<h2>Your OTP is: ${otpValue}</h2>`;
    await sendEmail(email, "Registration OTP", emailBody);

    return res.status(200).json(new ApiResponse(200, null, "OTP sent successfully"));
});

// --- 2. Register User ---
const registerUser = AsyncHandler(async (req, res) => {
    const { fullName, email, phone, password, otp } = req.body;

    if ([fullName, email, phone, password, otp].some((f) => !f || f.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const recentOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!recentOtp || otp !== recentOtp.otp) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    const existedUser = await RecoUser.findOne({ $or: [{ email }, { phoneNumber: phone }] });
    if (existedUser) throw new ApiError(409, "User already exists");

    const user = await RecoUser.create({
        fullName,
        email,
        phoneNumber: phone, 
        password,
        upiId: `${phone}@fastpay`,
        userId: email // Mapping legacy field to email to prevent E11000 duplicate index errors
    });

    const createdUser = await RecoUser.findById(user._id).select("-password -refreshToken");
    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// --- 3. Login User ---
const loginUser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await RecoUser.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await RecoUser.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    };

    return res.status(200)
        .cookie("recoAccessToken", accessToken, cookieOptions)
        .cookie("recoRefreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Logged in successfully"));
});

// --- 4. Logout User ---
const logoutUser = AsyncHandler(async (req, res) => {
    await RecoUser.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    return res.status(200)
        .clearCookie("recoAccessToken", { httpOnly: true, secure: true })
        .clearCookie("recoRefreshToken", { httpOnly: true, secure: true })
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// --- 5. Refresh Token ---
const refreshAccessToken = AsyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.recoRefreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await RecoUser.findById(decodedToken?._id);

        if (!user || incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or invalid");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        };

        return res.status(200)
            .cookie("recoAccessToken", accessToken, cookieOptions)
            .cookie("recoRefreshToken", newRefreshToken, cookieOptions)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});
const linkBankAccount = async (req, res, next) => {
    try {
        const { bankName, accountNumber, ifscCode } = req.body;

        if (!bankName || !accountNumber || !ifscCode) {
            throw new ApiError(400, "All bank details are required");
        }

        // Verify with Mock Bank API to ensure the account truly exists in the DB
        try {
            const mockBankUrl = process.env.MOCK_BANK_API_URL || 'http://localhost:5000/api/v1/bank';
            await axios.post(`${mockBankUrl}/verify`, { accountNumber, ifsc: ifscCode });
        } catch (err) {
            throw new ApiError(400, "Verification Failed: This account number and IFSC do not exist in the bank's database. Create it first.");
        }

        // Update the logged-in user with their bank details by safely pushing to the array
        const user = await RecoUser.findByIdAndUpdate(
            req.user._id, 
            { $addToSet: { linkedBankAccount: accountNumber } }, 
            { new: true, validateBeforeSave: false }
        );

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(new ApiResponse(200, { bankName, accountNumber }, "Bank linked successfully"));
    } catch (error) {
        next(error);
    }
};

const getUserAccounts = async (req, res, next) => {
    try {
        const user = await RecoUser.findById(req.user._id);
        
        if (!user.linkedBankAccount || user.linkedBankAccount.length === 0) {
            return res.status(200).json(new ApiResponse(200, [], "No linked accounts"));
        }

        const mockBankUrl = process.env.MOCK_BANK_API_URL || 'http://localhost:5000/api/v1/bank';
        
        const accountDataPromises = user.linkedBankAccount.map(async (accountNumber) => {
            let bankName = "Linked Bank";
            let balance = 0;
            let ifscCode = "N/A";
            let transactions = [];

            try {
                // 1. Fetch exact DB details from the new mock bank api route
                const accRes = await axios.get(`${mockBankUrl}/account-details/${accountNumber}`);
                if (accRes.data.success && accRes.data.account) {
                    bankName = accRes.data.account.bankId?.name || "Linked Bank";
                    balance = accRes.data.account.balance || 0;
                    ifscCode = accRes.data.account.ifsc || "N/A";
                }
                
                // 2. Fetch full exact transactions statement
                const txRes = await axios.get(`${mockBankUrl}/statement/${accountNumber}`);
                if (txRes.data.success && txRes.data.transactions) {
                    transactions = txRes.data.transactions.map(tx => ({
                        id: tx._id,
                        desc: tx.remarks || 'Transaction',
                        date: new Date(tx.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
                        amount: `${tx.type === 'CREDIT' ? '+' : '-'} ₹${tx.amount.toLocaleString('en-IN')}`,
                        isPositive: tx.type === 'CREDIT'
                    }));
                }
            } catch (err) {
                console.error(`Failed to fetch from Mock Bank API for ${accountNumber}:`, err.message);
            }

            return {
                _id: user._id,
                bankName, 
                accountNumber,
                ifsc: ifscCode,
                balance,
                transactions 
            };
        });

        const accountData = await Promise.all(accountDataPromises);
        return res.status(200).json(new ApiResponse(200, accountData, "Accounts fetched"));
    } catch (error) {
        next(error);
    }
};

const activateFastPay = async (req, res, next) => {
    try {
        const user = await RecoUser.findByIdAndUpdate(
            req.user._id,
            { isFastPayActive: true },
            { new: true, validateBeforeSave: false } // Allows saving new fields easily safely
        );

        if (!user) throw new ApiError(404, "User not found");

        return res.status(200).json(new ApiResponse(200, {
            isFastPayActive: user.isFastPayActive, 
            upiId: user.upiId
        }, "FastPay activated successfully"));
    } catch (error) {
        next(error);
    }
};
// Add this to user.controller.js
const getAllContacts = AsyncHandler(async (req, res) => {
    // Fetch all users, but exclude passwords and sensitive tokens
    const contacts = await RecoUser.find({}).select("fullName upiId email phoneNumber");
    
    return res.status(200).json(
        new ApiResponse(200, contacts, "Contacts fetched successfully")
    );
});

// History and Contacts logic below...

const getTransactionHistory = AsyncHandler(async (req, res) => {
    const transactions = await Transaction.find({
        $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    }).populate("senderId receiverId", "fullName email");
    
    return res.status(200).json(new ApiResponse(200, transactions, "Reconciliation transactions fetched"));
});

const savePushSubscription = AsyncHandler(async (req, res) => {
    const { subscription } = req.body;

    if (!subscription) throw new ApiError(400, "Subscription is required");

    await RecoUser.findByIdAndUpdate(
        req.user._id,
        { pushSubscription: subscription },
        { new: true, validateBeforeSave: false }
    );

    return res.status(200).json(new ApiResponse(200, null, "Push subscription saved successfully"));
});

// --- SESSION VALIDATION ---
const validateSession = AsyncHandler(async (req, res) => {
    // If verifyJWT middleware passes, req.user is populated and session is valid.
    return res.status(200).json(
        new ApiResponse(200, req.user, "Session is valid")
    );
});

// ✅ ONLY ONE EXPORT BLOCK
export { 
    sendOTP, 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    linkBankAccount,
    getUserAccounts,
    activateFastPay,
    getAllContacts,
    getTransactionHistory,
    savePushSubscription,
    validateSession
};