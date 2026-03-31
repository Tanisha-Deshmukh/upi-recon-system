import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const discover = async () => {
    try {
        const client = await mongoose.connect(process.env.MONGODB_URI);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        
        console.log("Databases on cluster:");
        for (const dbInfo of dbs.databases) {
            console.log(`- ${dbInfo.name}`);
            const db = mongoose.connection.useDb(dbInfo.name);
            const collections = await db.db.listCollections().toArray();
            const userColl = collections.find(c => c.name === "users");
            if (userColl) {
                const user = await db.collection("users").findOne({ email: "tanishadeshmukh44@gmail.com" });
                if (user) {
                    console.log(`  [MATCH] Found user in DB: ${dbInfo.name}`);
                    console.log(`  Name: ${user.fullName}, Email: ${user.email}`);
                } else {
                    console.log(`  [Info] 'users' collection exists in ${dbInfo.name}, but this email is not there.`);
                }
            }
        }
        process.exit(0);
    } catch (error) {
        console.error("Discovery failed:", error);
        process.exit(1);
    }
};

discover();
