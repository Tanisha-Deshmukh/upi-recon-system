import admin from "firebase-admin";

// Make sure you initialize Firebase admin in your index.js or app.js first!
export const sendPushNotification = async (deviceToken, title, body) => {
    if (!deviceToken) {
        console.log("Skipping notification: User doesn't have a device token.");
        return;
    }

    const message = {
        notification: {
            title: title,
            body: body
        },
        token: deviceToken,
    };

    try {
        await admin.messaging().send(message);
        console.log("📱 Push Notification sent successfully!");
    } catch (error) {
        console.error("Failed to send Firebase notification:", error.message);
    }
};