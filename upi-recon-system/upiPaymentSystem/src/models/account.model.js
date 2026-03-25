import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bankName: { type: String, required: true },
    bankId: { type: String }, // 🟢 Added to store the Mock Bank's ID for this bank
    accountNumber: { type: String, required: true, unique: true },
    ifscCode: { type: String, required: true, uppercase: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
    isPrimary: { type: Boolean, default: false }
}, { timestamps: true });

export const Account = mongoose.model('Account', accountSchema);