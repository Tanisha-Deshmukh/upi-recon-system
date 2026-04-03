// Diagnose what's actually stored in the UPI accounts collection
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const AccountSchema = new mongoose.Schema({}, { strict: false });
const Account = mongoose.model("Account", AccountSchema, "accounts");

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const accounts = await Account.find({});
    console.log("All accounts in UPI DB:");
    accounts.forEach(a => console.log(JSON.stringify({ accountNumber: a.accountNumber, ifscCode: a.ifscCode, bankId: a.bankId })));
    mongoose.disconnect();
};

run().catch(e => { console.error(e.message); process.exit(1); });
