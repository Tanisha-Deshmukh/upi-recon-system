import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
    email: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true }, // Added this
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } 
}, { timestamps: true });

export const Otp = mongoose.model("Otp", otpSchema);