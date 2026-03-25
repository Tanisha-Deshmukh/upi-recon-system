import mongoose from "mongoose";
import dotenv from "dotenv";
import { RecoUser } from "./src/models/recoUser.model.js";

dotenv.config();

async function checkDB() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/reco_service_db`);
        const users = await RecoUser.find();
        
        for (const user of users) {
             console.log(`Email: ${user.email}`);
             // check common passwords
             const testPasswords = ["password", "tanisha", "tanisha123", "fastpay_secure_oauth", "admin", "123456"];
             for (const p of testPasswords) {
                 const isCorr = await user.isPasswordCorrect(p);
                 if (isCorr) {
                     console.log(`[SUCCESS] Password for ${user.email} is '${p}'`);
                 }
             }
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}
checkDB();
