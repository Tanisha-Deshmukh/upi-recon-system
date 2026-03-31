import mongoose from "mongoose";
import dotenv from "dotenv";
import { RecoUser } from "./src/models/recoUser.model.js";

dotenv.config();

async function checkDB() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/reco_service_db`);
        const users = await RecoUser.find();
        console.log(`Found ${users.length} users in RecoUser (reco_service_db).`);
        for (const user of users) {
             console.log(`Email: ${user.email}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}
checkDB();
