import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";

dotenv.config();

async function checkFastPayDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find();
        console.log(`Found ${users.length} users in FastPay User DB.`);
        for (const user of users) {
             console.log(`Email: ${user.email}, Phone: ${user.phone}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}
checkFastPayDB();
