import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for migration...");

        const newPin = "779607";
        const hashedPin = await bcrypt.hash(newPin, 10);

        const result = await User.updateMany(
            {}, 
            { $set: { fastpayPin: hashedPin } }
        );

        console.log(`Successfully updated ${result.modifiedCount} users with the new PIN: ${newPin}`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
