// import mongoose, { Schema } from "mongoose";

// const transactionSchema = new Schema({
//     senderId: {
//         type: Schema.Types.ObjectId,
//         ref: "User", // Links the transaction to Tanisha or any other user
//         required: true
//     },
//     receiverId: {
//         type: Schema.Types.ObjectId,
//         ref: "User"
//     },
//     amount: { 
//         type: Number, 
//         required: true,
//         min: [1, "Amount must be greater than 0"]
//     },
//     senderAccount: { 
//         type: String, 
//         required: true 
//     },
//     receiverUpi: { 
//         type: String, 
//         required: true 
//     },
//     status: { 
//         type: String, 
//         enum: ['PENDING', 'SUCCESS', 'FAILED'], 
//         default: 'PENDING' 
//     },
//     utr: { 
//         type: String, 
//         unique: true, 
//         sparse: true 
//     },
//     // New field for Reconciliation logic
//     reconciled: {
//         type: Boolean,
//         default: false
//     }
// }, { timestamps: true });

// export const Transaction = mongoose.model("Transaction", transactionSchema);









import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema({
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true, min: [1, "Min 1 rupee"] },
    senderAccount: { type: String, required: true },
    receiverUpi: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    utr: { type: String, unique: true, sparse: true },
    requestId: { type: String, unique: true, sparse: true }, // Idempotency key
    // Add this inside your transactionSchema object
    note: { 
        type: String, 
        trim: true,
        default: "" 
    },
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);