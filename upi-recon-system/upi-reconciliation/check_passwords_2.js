import mongoose from "mongoose";
import dotenv from "dotenv";
import { RecoUser } from "./src/models/recoUser.model.js";

dotenv.config();

async function printDB() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/reco_service_db`);
        const users = await RecoUser.find();
        for (const user of users) {
             console.log(`Email: ${user.email}, Hash: ${user.password}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}
printDB();
