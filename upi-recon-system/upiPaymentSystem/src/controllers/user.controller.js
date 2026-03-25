import { AsyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/mailer.js"; 
import { Account } from "../models/account.model.js";
import { resolveBankId } from "../utils/bankHelper.js";
import axios from "axios";

// helper func to get both tokens for login
const generateAccessAndRefreshToken = async(userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

export const sendUpiOtp = AsyncHandler(async (req, res) => {
    const { email, phoneNumber } = req.body;
    if (!email || !phoneNumber) throw new ApiError(400, "Fields missing");

    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    //console.log("generated otp: ", otpValue)
    await Otp.create({ email, phoneNumber, otp: otpValue });

    await sendEmail(email, "Your OTP", `Your code is: ${otpValue}`);
    return res.status(200).json(new ApiResponse(200, null, "OTP sent"));
});

export const registerUser = AsyncHandler(async (req, res) => {
    const { fullName, email, phone, password, otp } = req.body;

    const recentOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!recentOtp || recentOtp.otp !== otp) throw new ApiError(400, "Invalid OTP");

    const newUser = await User.create({
        fullName,
        email,
        phone, 
        password,
        upiId: `${phone}@fastpay`
    });

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
    return res.status(201).json(new ApiResponse(201, createdUser, "Registered"));
});

export const loginUser = AsyncHandler(async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid credentials");
    }
     
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    return res.status(200)
        .cookie("fastpayAccessToken", accessToken, { httpOnly: true, secure: false, sameSite: 'lax' })
        .cookie("fastpayRefreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: 'lax' })
        .json(new ApiResponse(200, { user, accessToken, refreshToken }, "Logged in"));
});

export const logoutUser = AsyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } });
    return res.status(200)
        .clearCookie("fastpayAccessToken")
        .clearCookie("fastpayRefreshToken")
        .json(new ApiResponse(200, {}, "Logged out"));
});

export const linkBankAccount = AsyncHandler(async (req, res) => {
    const { bankName, accountNumber, ifscCode } = req.body;

    const existing = await Account.findOne({ accountNumber });
    if (existing) throw new ApiError(409, "This account is already linked.");

    try {
        const bankVerifyUrl = `${process.env.BANK_API_URL}/verify`; 
        
        const verifyResponse = await axios.post(bankVerifyUrl, {
            accountNumber,
            ifsc: ifscCode
        });

        if (verifyResponse.data && verifyResponse.data.success) {
            const realBalance = verifyResponse.data.balance;
            
            const newAccount = await Account.create({
                userId: req.user._id,
                bankName,
                accountNumber,
                ifscCode,
                balance: realBalance,
                isPrimary: true
            });

            // push this new acc into the array
            await User.findByIdAndUpdate(req.user._id, {
                $push: { linkedBankAccounts: newAccount._id }
            });

            return res.status(201).json(
                new ApiResponse(201, newAccount, "Bank account linked successfully!")
            );
        }
    } catch (error) {
        console.error("Link Bank Account Error:", error.message || error);
        if (error.response) {
            // error coming from the mock api
            const errorMessage = error.response.data?.message || "Failed to verify account with the bank.";
            throw new ApiError(400, errorMessage);
        } else {
            // normal db error or something
            throw new ApiError(500, error.message || "An internal error occurred while linking the account.");
        }
    }
});

export const getUserAccounts = AsyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("linkedBankAccounts");
        
        if (!user.linkedBankAccounts || user.linkedBankAccounts.length === 0) {
            return res.status(200).json(new ApiResponse(200, [], "No linked accounts"));
        }

        const accountDataPromises = user.linkedBankAccounts.map(async (account) => {
            let transactions = [];
            let liveBalance = account.balance || 0;
            
            try {
                const mockBankUrl = process.env.BANK_API_URL || 'http://localhost:5000/api/v1/bank';
                const baseUrl = mockBankUrl.replace(/\/bank$/, '');
                
                // Fetch real-time balance
                try {
                    const accRes = await axios.get(`${baseUrl}/bank/account-details/${account.accountNumber}`);
                    if (accRes.data.success && accRes.data.account) {
                        liveBalance = accRes.data.account.balance || 0;
                    }
                } catch (balanceErr) {
                    console.error(`Failed to fetch live balance for ${account.accountNumber}:`, balanceErr.message);
                }

                // Fetch transactions
                const txRes = await axios.get(`${baseUrl}/bank/statement/${account.accountNumber}`);
                if (txRes.data.success && txRes.data.transactions) {
                    transactions = txRes.data.transactions.map(tx => ({
                        id: tx._id,
                        desc: tx.remarks || 'Transaction',
                        date: new Date(tx.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
                        amount: `${tx.type === 'CREDIT' ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN')}`,
                        isPositive: tx.type === 'CREDIT'
                    }));
                }
            } catch (err) {
                console.error(`Failed to fetch from Mock Bank API for account ${account.accountNumber}:`, err.message);
            }

            return {
                _id: account._id,
                bankName: account.bankName, 
                accountNumber: account.accountNumber,
                ifsc: account.ifscCode,
                balance: liveBalance,
                transactions 
            };
        });

        const accountData = await Promise.all(accountDataPromises);

        return res.status(200).json(new ApiResponse(200, accountData, "Accounts fetched"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
});

export const activateFastPay = AsyncHandler(async (req, res) => {
    const { upiId } = req.body;
    let finalUpiId = req.user.upiId;

    if (upiId && upiId !== finalUpiId) {
        const existing = await User.findOne({ upiId });
        if (existing) {
            throw new ApiError(409, "This UPI ID is already taken. Please try another one.");
        }
        await User.findByIdAndUpdate(req.user._id, { upiId });
        finalUpiId = upiId;
    }

    return res.status(200).json(new ApiResponse(200, {
        isFastPayActive: true, 
        upiId: finalUpiId
    }, "FastPay activated successfully"));
});

export const updateUpiId = AsyncHandler(async (req, res) => {
    const { upiId } = req.body;
    if (!upiId) throw new ApiError(400, "UPI ID is required");

    const existing = await User.findOne({ upiId });
    if (existing && existing._id.toString() !== req.user._id.toString()) {
         throw new ApiError(409, "This UPI ID is already taken. Please try another one.");
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { upiId }, { new: true });
    
    return res.status(200).json(new ApiResponse(200, {
        upiId: updatedUser.upiId
    }, "UPI ID updated successfully"));
});

export const fastpaySignup = AsyncHandler(async (req, res) => {
    const { phone, fullName, email, upiId, fastpayPin, fastpayName, bankName, accountNumber, ifscCode } = req.body;
    
    if (!upiId || !accountNumber || !ifscCode || !phone || !fastpayPin) {
        throw new ApiError(400, "Missing required FastPay registration details (UPI, Bank, Phone, or PIN)");
    }

    // check if upi is unique
    const existingUpi = await User.findOne({ upiId });
    if (existingUpi) {
         throw new ApiError(409, "This UPI ID is already taken. Please try another one.");
    }

    // Verify the Phone number uniqueness inside isolated FastPay DB
    let user = await User.findOne({ phone });
    if (user) {
        throw new ApiError(409, "A FastPay profile already exists with this phone number. Please log in.");
    }

    let realBalance = 0;
    try {
        const bankVerifyUrl = `${process.env.BANK_API_URL || 'http://localhost:5000/api/v1/bank'}/verify`; 
        const verifyResponse = await axios.post(bankVerifyUrl, { accountNumber, ifsc: ifscCode });
        if (verifyResponse.data && verifyResponse.data.success) {
            realBalance = verifyResponse.data.balance;
        } else {
            throw new Error();
        }
    } catch(err) {
        throw new ApiError(400, "Failed to verify bank account with Mock Bank.");
    }

    user = await User.create({
        fullName: fullName || "FastPay User",
        email: email || `${phone}@fastpay.com`,
        phone,
        password: "fastpay_secure_oauth", // dummy pass
        upiId,
        fastpayPin, // gets hashed later anyway
        fastpayName: fastpayName || fullName
    });

    const bankId = await resolveBankId(accountNumber, ifscCode);

    const newAccount = await Account.create({
        userId: user._id,
        bankName: bankName || "Linked Bank",
        bankId: bankId || null,
        accountNumber,
        ifscCode,
        balance: realBalance,
        isPrimary: true
    });

    user.linkedBankAccounts = [newAccount._id];
    user.fastpayAccount = newAccount._id;
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res.status(200)
        .cookie("fastpayAccessToken", accessToken, { httpOnly: true, secure: false, sameSite: 'lax' })
        .cookie("fastpayRefreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: 'lax' })
        .json(new ApiResponse(200, {
            upiId: user.upiId,
            fastpayName: user.fastpayName,
            fastpayAccount: user.fastpayAccount,
            isFastPayActive: true,
            accessToken,
            refreshToken
        }, "FastPay Profile registered successfully!"));
});

export const fastpayLogin = AsyncHandler(async (req, res) => {
    const { upiId, fastpayPin } = req.body;
    if (!upiId || !fastpayPin) throw new ApiError(400, "UPI ID and PIN are required to login to FastPay");

    const user = await User.findOne({ upiId });
    if (!user) {
        throw new ApiError(404, "Invalid FastPay UPI ID. No profile found.");
    }

    const isPinValid = await user.isPinCorrect(fastpayPin);
    if (!isPinValid) {
        throw new ApiError(401, "Invalid FastPay PIN. Access denied.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res.status(200)
        .cookie("fastpayAccessToken", accessToken, { httpOnly: true, secure: false, sameSite: 'lax' })
        .cookie("fastpayRefreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: 'lax' })
        .json(new ApiResponse(200, {
            isFastPayActive: true,
            upiId: user.upiId,
            fastpayName: user.fastpayName,
            fastpayAccount: user.fastpayAccount,
            accessToken,
            refreshToken
        }, "Logged into FastPay dashboard!"));
});

export const getAllContacts = AsyncHandler(async (req, res) => {
    const contacts = await User.find({ _id: { $ne: req.user._id } }).select("fullName upiId email phone");
    
    return res.status(200).json(
        new ApiResponse(200, contacts, "Contacts fetched successfully")
    );
});