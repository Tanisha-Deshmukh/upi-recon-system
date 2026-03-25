import mongoose from "mongoose";
import dotenv from "dotenv";
import { RecoUser } from "./src/models/recoUser.model.js";
import { Transaction } from "./src/models/transaction.model.js";

dotenv.config();

async function checkStats() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/reco_service_db`);
        
        const user1 = await RecoUser.findOne({ email: "tanishadeshmukh44@gmail.com" });
        const user2 = await RecoUser.findOne({ email: "tanishadeshmukh38@gmail.com" });

        console.log(`User 1 (${user1.email}): _id ${user1._id}`);
        console.log(`User 2 (${user2.email}): _id ${user2._id}`);

        const txns1 = await Transaction.find({
            $or: [{ senderId: user1._id }, { receiverId: user1._id }],
            status: "SUCCESS"
        });
        
        const txns2 = await Transaction.find({
            $or: [{ senderId: user2._id }, { receiverId: user2._id }],
            status: "SUCCESS"
        });

        const sum1 = txns1.reduce((sum, tx) => sum + tx.amount, 0);
        const sum2 = txns2.reduce((sum, tx) => sum + tx.amount, 0);

        console.log(`\nStats for User 1:`);
        console.log(`Total Success Txns: ${txns1.length}`);
        console.log(`Total Amount: ${sum1}`);
        console.log(`Txn IDs:`, txns1.map(t => t._id.toString()));

        console.log(`\nStats for User 2:`);
        console.log(`Total Success Txns: ${txns2.length}`);
        console.log(`Total Amount: ${sum2}`);
        console.log(`Txn IDs:`, txns2.map(t => t._id.toString()));

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}

checkStats();
