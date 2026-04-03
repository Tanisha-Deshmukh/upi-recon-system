import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const TxnSchema = new mongoose.Schema({}, { strict: false });
const Txn = mongoose.model("Transaction", TxnSchema, "transactions");

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI + "/upi_payment_db");
    const pending = await Txn.find({ status: "PENDING" });
    console.log(`\n🔍 PENDING transactions: ${pending.length}`);
    pending.forEach(t => console.log(`  - ID: ${t._id}, Amount: ${t.amount}, Account: ${t.senderAccount}, Status: ${t.status}`));

    const recent = await Txn.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`\n📋 Last 5 transactions:`);
    recent.forEach(t => console.log(`  - ID: ${t._id}, Amount: ${t.amount}, Status: ${t.status}, Account: ${t.senderAccount}`));

    mongoose.disconnect();
};
run().catch(e => { console.error(e); process.exit(1); });
