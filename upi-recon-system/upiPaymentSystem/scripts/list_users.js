import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const findUsers = async () => {
    try {
        console.log("Searching upiPaymentSystem (Port 8000 context)...");
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await mongoose.connection.db.collection("users").find({}).toArray();
        console.log(`Found ${users.length} users in UPI-PAYMENT-SYSTEM:`);
        users.forEach(u => console.log(`- ${u.email} (${u.fullName})`));
        await mongoose.disconnect();

        // Check if there's a reconciliation DB URI
        // For now, let's just list what we found.
        process.exit(0);
    } catch (error) {
        console.error("Search failed:", error);
        process.exit(1);
    }
};

findUsers();
