import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { User } from "./src/models/user.model.js";

dotenv.config({ path: "./.env" });

const DB_NAME = "upi_payment_db";

async function checkUser(email) {
    let output = "";
    try {
        output += `Connecting to MongoDB for ${DB_NAME}...\n`;
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        output += "Connected.\n";

        const user = await User.findOne({ email });
        if (user) {
            output += `User found in ${DB_NAME}:\n`;
            output += JSON.stringify(user, null, 2) + "\n";
        } else {
            output += `User ${email} NOT found in ${DB_NAME}.\n`;
            
            // Check all users to see if there's a similar email or if the DB is empty
            const allUsers = await User.find({}, { email: 1 }).limit(10);
            output += `Existing user emails (limit 10): ${allUsers.map(u => u.email).join(", ")}\n`;
        }
    } catch (error) {
        output += `Error: ${error.message}\n`;
    } finally {
        await mongoose.disconnect();
        fs.writeFileSync("check_user_result_payment.txt", output);
    }
}

const emailToCheck = "tanishadeshmukh38@gmail.com";
checkUser(emailToCheck);
