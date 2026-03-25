import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema({
    senderId: { type: Schema.Types.ObjectId, ref: "RecoUser" }, // Fixed reference
    receiverId: { type: Schema.Types.ObjectId, ref: "RecoUser" }, // Fixed reference
    amount: { type: Number, required: true, min: [1, "Min 1 rupee"] },
    senderAccount: { type: String, required: true },
    receiverUpi: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    utr: { type: String, unique: true, sparse: true },
    note: { 
        type: String, 
        trim: true,
        default: "" 
    },
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);