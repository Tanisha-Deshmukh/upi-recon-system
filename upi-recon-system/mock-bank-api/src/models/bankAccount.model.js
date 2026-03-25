import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema({
    // This is the link to the Bank model
    bankId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Bank", 
        required: true 
    },
    accountNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    ifsc: { 
        type: String, 
        required: true 
    },
    phoneNumber: { 
        type: String, 
        required: true, 
        index: true 
    },
    balance: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    holderName: { 
        type: String, 
        required: true 
    },
    pin: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

export const BankAccount = mongoose.model("BankAccount", bankAccountSchema);