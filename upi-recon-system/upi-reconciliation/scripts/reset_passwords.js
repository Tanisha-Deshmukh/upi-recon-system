import mongoose from "mongoose";
import dotenv from "dotenv";
import { RecoUser } from "./src/models/recoUser.model.js";

dotenv.config();

async function resetPasswords() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/reco_service_db`);
        const users = await RecoUser.find();
        
        for (const user of users) {
             console.log(`Setting password for: ${user.email}`);
             user.password = "_tanisha_.001";
             await user.save();
             console.log(`Success! Password for ${user.email} is now '_tanisha_.001'`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}
resetPasswords();
