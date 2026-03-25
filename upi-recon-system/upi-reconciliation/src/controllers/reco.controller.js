import { RecoUser } from "../models/recoUser.model.js";
import { Otp } from "../models/otp.model.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import axios from "axios";

// generating tokens for auth
const generateTokens = async (userId) => {
    const user = await RecoUser.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

// send login otp
export const sendOTP = AsyncHandler(async (req, res) => {
    console.log("📥 RECOV BODY:", req.body);
    const { email, phoneNumber } = req.body;
    if (!email || !phoneNumber) throw new ApiError(400, "Email and Phone are required");

    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    
    // saving otp temporarily
    await Otp.create({ email, phoneNumber, otp: otpValue });

    await sendEmail(email, "Reconciliation System - OTP", `Your code: ${otpValue}`);
    return res.status(200).json(new ApiResponse(200, null, "OTP sent successfully"));
});

// signup
export const registerUser = AsyncHandler(async (req, res) => {
    const { fullName, email, phone, password, otp } = req.body;

    const recentOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!recentOtp || recentOtp.otp !== otp) throw new ApiError(400, "Invalid OTP");

    const user = await RecoUser.create({
        fullName,
        email,
        phoneNumber: phone, // Maps 'phone' from frontend to 'phoneNumber' in DB
        password
    });

    const createdUser = await RecoUser.findById(user._id).select("-password -refreshToken");
    return res.status(201).json(new ApiResponse(201, createdUser, "Registered successfully"));
});

// login handler
export const loginUser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await RecoUser.findOne({ email });

    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);
    return res.status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .json(new ApiResponse(200, { user, accessToken }, "Logged in"));
});

// recon checks
export const getTxnStatus = AsyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const txn = await Transaction.findOne({ transactionId });
    if (!txn) throw new ApiError(404, "Transaction not found");
    res.status(200).json(new ApiResponse(200, txn, "Status fetched"));
});