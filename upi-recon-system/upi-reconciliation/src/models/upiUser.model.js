import mongoose, { Schema } from "mongoose";

// A minimal schema to read from the 'users' collection used by upiPaymentSystem
const upiUserSchema = new Schema({
    fullName: String,
    email: String,
    phone: String,
    upiId: String
}, { strict: false });

export const UpiUser = mongoose.model("User", upiUserSchema);
