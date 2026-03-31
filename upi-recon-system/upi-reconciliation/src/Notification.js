import admin from "firebase-admin";

let firebaseInitialized = false;

try {
    if (!admin.apps.length) {
        admin.initializeApp();
        firebaseInitialized = true;
    } else {
        firebaseInitialized = true;
    }
} catch (e) {
    console.warn("Firebase Admin not initialized (no credentials). Push notifications via FCM will be skipped.");
}

export const sendPushNotification = async (deviceToken, title, body) => {
    if (!deviceToken) {
        console.log("Skipping notification: User doesn't have a device token.");
        return;
    }
    if (!firebaseInitialized) {
        console.log("Skipping FCM notification: Firebase not configured.");
        return;
    }

    const message = {
        notification: { title, body },
        token: deviceToken,
    };

    try {
        await admin.messaging().send(message);
        console.log("📱 Push Notification sent successfully!");
    } catch (error) {
        console.error("Failed to send Firebase notification:", error.message);
    }
};