import mongoose from "mongoose";
import dotenv from "dotenv";
import { RecoUser } from "./src/models/recoUser.model.js";
import { sendPushNotification } from "./src/utils/webpush.js";

dotenv.config();

async function testPush() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const usersWithPush = await RecoUser.find({ pushSubscription: { $exists: true, $ne: null } });
        console.log(`Found ${usersWithPush.length} users with push subscriptions.`);

        if (usersWithPush.length > 0) {
            const user = usersWithPush[usersWithPush.length - 1]; // test the most recent one
            console.log(`Testing push for user: ${user.email}`);

            await sendPushNotification(user.pushSubscription, {
                title: "Test ✅",
                body: `This is a test notification for 888.`,
                icon: "/logo192.png",
                data: { url: "/dashboard" }
            });
            console.log("Test finished.");
        } else {
            console.log("No subscriptions found in DB. You might need to log in to React app and allow notifications.");
        }
    } catch (e) {
        console.error("Error during test:", e);
    } finally {
        mongoose.connection.close();
    }
}

testPush();
