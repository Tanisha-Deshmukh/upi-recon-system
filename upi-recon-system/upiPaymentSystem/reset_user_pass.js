import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const reset = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = "tanishadeshmukh44@gmail.com";
        const newPasswordRaw = "_tanisha_.001";
        const hashedPassword = await bcrypt.hash(newPasswordRaw, 10);

        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        
        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            if (["admin", "local", "config"].includes(dbName)) continue;

            const db = mongoose.connection.useDb(dbName);
            const collections = await db.db.listCollections().toArray();
            
            // Check all collections that might store users
            for (const collInfo of collections) {
                const collName = collInfo.name;
                if (collName.toLowerCase().includes("user")) {
                    const result = await db.collection(collName).updateMany(
                        { email: email },
                        { $set: { password: hashedPassword } }
                    );
                    if (result.modifiedCount > 0) {
                        console.log(`Updated password for ${email} in ${dbName}.${collName}`);
                    }
                }
            }
        }
        console.log("Password reset attempt completed.");
        process.exit(0);
    } catch (error) {
        console.error("Reset failed:", error);
        process.exit(1);
    }
};

reset();
