// Quick fix script - updates stale bankIds in the UPI database
// after re-seeding the Mock Bank (which regenerates new MongoDB IDs)
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config({ path: "./upi-recon-system/upiPaymentSystem/.env" });

const AccountSchema = new mongoose.Schema({}, { strict: false });
const Account = mongoose.model("Account", AccountSchema, "accounts");

const run = async () => {
    // Step 1: Ask the Mock Bank for its current SBI bank ID
    const bankRes = await axios.get("http://localhost:5000/api/v1/bank/banks");
    const sbi = bankRes.data.banks.find(b => b.shortName === "SBI");
    if (!sbi) { console.error("SBI not found in bank!"); process.exit(1); }
    console.log(`✅ New SBI bankId: ${sbi._id}`);

    // Step 2: Connect to the UPI database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to UPI database");

    // Step 3: Update all UPI accounts that have SBIN IFSC to use the correct bankId
    const result = await Account.updateMany(
        { ifscCode: { $regex: "^SBIN", $options: "i" } },
        { $set: { bankId: sbi._id } }
    );
    console.log(`✅ Updated ${result.modifiedCount} account(s) with new bankId`);
    
    process.exit(0);
};

run().catch(e => { console.error("Error:", e.message); process.exit(1); });
