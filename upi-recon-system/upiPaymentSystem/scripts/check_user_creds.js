import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = "tanishadeshmukh44@gmail.com";
        const user = await User.findOne({ email });
        if (user) {
            console.log("User found:");
            console.log(`Email: ${user.email}`);
            console.log(`FullName: ${user.fullName}`);
            console.log(`Password (hashed): ${user.password}`);
            console.log(`FastPay PIN (hashed): ${user.fastpayPin}`);
        } else {
            console.log(`User with email ${email} not found.`);
        }
        process.exit(0);
    } catch (error) {
        console.error("Check failed:", error);
        process.exit(1);
    }
};

check();
