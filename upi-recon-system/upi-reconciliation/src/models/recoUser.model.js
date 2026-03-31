import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const RecoUserSchema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    upiId: { type: String }, 
    
    userId: { type: String, required: false }, 
    linkedBankAccount: [{ type: String }], 
    isFastPayActive: { type: Boolean, default: false },
    
    refreshToken: { type: String },
    pushSubscription: { type: Object }
}, { timestamps: true });

// ✅ THE FIX: Removed "next" from the async function
RecoUserSchema.pre("save", async function () {
    // If password isn't modified, just exit the function
    if (!this.isModified("password")) return; 
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password for login
RecoUserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate Tokens
RecoUserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
};

RecoUserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
    );
};

export const RecoUser = mongoose.model("RecoUser", RecoUserSchema);