import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:example@gmail.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export const sendPushNotification = async (subscription, payload) => {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        console.log("Push notification sent successfully");
    } catch (error) {
        console.error("Error sending push notification:", error);
        // If subscription is invalid/expired, we should ideally remove it from DB
        if (error.statusCode === 404 || error.statusCode === 410) {
            console.log("Subscription has expired or is no longer valid");
            return { error: "expired" };
        }
    }
};

export default webpush;
