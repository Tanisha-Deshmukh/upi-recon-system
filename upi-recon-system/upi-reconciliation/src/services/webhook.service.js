import axios from "axios";
import { RecoUser } from "./models/recoUser.model.js";

export const notifyMerchant = async (transaction) => {
    try {
        // 1. Find the merchant/receiver's details using their UPI ID
        const merchant = await RecoUser.findOne({ upiId: transaction.receiverUpiId });

        if (!merchant) {
            console.error(`❌ No merchant found for UPI: ${transaction.receiverUpiId}`);
            return false;
        }

        // 2. Prepare the data to send to the merchant's server
        const payload = {
            transactionId: transaction.transactionId,
            amount: transaction.amount,
            status: "SUCCESS",
            timestamp: new Date()
        };

        // 3. Send the POST request to the merchant's linked bank account/server
        // Note: In a real app, this URL would be stored in the merchant's profile
        const response = await axios.post(`${merchant.linkedBankAccount}/webhook`, payload, {
            timeout: 5000 // Don't wait forever if their server is slow
        });

        if (response.status === 200) {
            console.log(`✅ Merchant ${merchant.fullName} notified successfully.`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`⚠️ Webhook failed for ${transaction.transactionId}: ${error.message}`);
        return false;
    }
};