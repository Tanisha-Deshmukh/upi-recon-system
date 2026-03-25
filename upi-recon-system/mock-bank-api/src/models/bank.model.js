import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    shortName: { 
        type: String, 
        required: true, 
        unique: true 
    },
    ifscPrefix: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

export const Bank = mongoose.model("Bank", bankSchema);