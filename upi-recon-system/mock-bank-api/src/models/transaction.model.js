import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    utrNumber: {
        type: String,
        required: true, 
        unique: true 
    },
    accountNumber: { 
        type: String, 
        required: true 
    },
    type: { type: String, 
        enum: ["DEBIT", "CREDIT"], 
        required: true 

    },
    amount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["SUCCESS", "FAILED"], 
        default: "SUCCESS" 
    },
    remarks: { 
        type: String 
    }
}, {
     timestamps: true
     }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);