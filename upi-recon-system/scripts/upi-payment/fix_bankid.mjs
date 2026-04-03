// Fix stale bankIds in the UPI Atlas database after re-seeding the Mock Bank
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// The account collection lives in the "fastpay" or "upi" database - try the URI with explicit db name
const MONGODB_URI = process.env.MONGODB_URI + "/upi_payment_db";

const AccountSchema = new mongoose.Schema({}, { strict: false });
const Account = mongoose.model("Account", AccountSchema, "accounts");

const run = async () => {
    // Step 1: Get the current SBI bankId from the Mock Bank
    const bankRes = await fetch("http://localhost:5000/api/v1/bank/list");
    const bankData = await bankRes.json();
    const sbi = bankData.banks.find(b => b.shortName === "SBI");
    if (!sbi) { console.error("SBI not found in Mock Bank!"); process.exit(1); }
    console.log(`✅ New SBI bankId: ${sbi._id}`);

    // Step 2: Connect to the Atlas UPI database
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to Atlas UPI database");

    // Step 3: Show all accounts first to diagnose
    const all = await Account.find({});
    console.log(`Found ${all.length} accounts:`);
    all.forEach(a => console.log(`  - Account: ${a.accountNumber}, IFSC: ${a.ifscCode}, bankId: ${a.bankId}`));

    // Step 4: Update ALL accounts to have the new bankId (since they're all in the same SBI mock bank)
    const result = await Account.updateMany({}, { $set: { bankId: new mongoose.Types.ObjectId(sbi._id) } });
    console.log(`✅ Updated ${result.modifiedCount} account(s) with new bankId`);

    mongoose.disconnect();
    process.exit(0);
};

run().catch(e => { console.error("Error:", e.message); process.exit(1); });
