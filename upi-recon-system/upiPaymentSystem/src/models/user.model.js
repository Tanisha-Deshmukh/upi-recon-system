import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new Schema({
    fullName: { type: String, required: true },
    fastpayName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    upiId: { type: String, unique: true, index: true }, // auto generated on signup
    password: { type: String, required: true },
    fastpayPin: { type: String }, // hashed pin, do not store plain text ever
    linkedBankAccounts: [{ 
        type: Schema.Types.ObjectId, 
        ref: "Account" 
    }],
    fastpayAccount: { 
        type: Schema.Types.ObjectId, 
        ref: "Account" 
    },
    balance: { type: Number, default: 1000 }, // wallet balance (optional for now)
    refreshToken: { type: String }
}, { timestamps: true });

UserSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    if (this.isModified("fastpayPin") && this.fastpayPin) {
        this.fastpayPin = await bcrypt.hash(this.fastpayPin, 10);
    }
});

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.isPinCorrect = async function (pin) {
    if (!this.fastpayPin) return false;
    return await bcrypt.compare(pin, this.fastpayPin);
};

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, upiId: this.upiId, phone: this.phone },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = mongoose.model("User", UserSchema);