import cron from "node-cron";
import axios from "axios";
import { Account } from "../models/account.model.js"; 
import { RecoUser } from "../models/recoUser.model.js";
import { Transaction } from "../models/transaction.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendPushNotification } from "../utils/webpush.js";

export const startReconciliationJob = () => {
    // Runs every 15 seconds (reduced from 2s to prevent thundering herd)
    cron.schedule("*/15 * * * * *", async () => {
        try {
            // 1. Fetch pending transactions from the Main UPI App (Port 8000)
            const bridgeUrl = "http://localhost:8000/api/v1/payments/recon";
            const pendingResponse = await axios.get(`${bridgeUrl}/pending`, { timeout: 5000 });
            
            const pendingTxns = pendingResponse.data?.data || [];
            if (pendingTxns.length === 0) return;

            console.log(`🔍 [Cron] Found ${pendingTxns.length} pending transactions. Verifying...`);

            for (const txn of pendingTxns) {
                try {
                    const bankStatusUrl = `http://localhost:5000/api/v1/bank/status/${txn.senderAccount}/${txn.amount}`;
                    const bankResponse = await axios.get(bankStatusUrl, { timeout: 5000 });

                    if (bankResponse.data && bankResponse.data.found) {
                        const bankUtr = bankResponse.data.utr;
                        console.log(`✅ [Recon] Bank confirmed Txn ${txn._id}. Updating main app...`);

                        // 3. Update the Main App via Bridge API
                        await axios.post(`${bridgeUrl}/update`, {
                            txnId: txn._id,
                            status: "SUCCESS",
                            utr: bankUtr
                        }, { timeout: 5000 });

                        // 4. Handle Notification & Local Sync Logic
                        const receiverEmail = txn.receiverId?.email;
                        const senderEmail = txn.senderId?.email;
                        
                        // Find local versions of sender and receiver in reco_service_db
                        const localReceiver = await RecoUser.findOne({ email: receiverEmail });
                        const localSender = await RecoUser.findOne({ email: senderEmail });
                        
                        if (localReceiver || localSender) {
                            console.log(`👤 [Recon] Syncing to local DB...`);
                            
                            // A. Create local transaction record so it shows in history
                            try {
                                // Check if this UTR already exists locally to avoid E11000
                                const existingLocal = await Transaction.findOne({ utr: bankUtr });
                                if (!existingLocal) {
                                    const localTxn = await Transaction.create({
                                        senderId: localSender?._id || null, 
                                        receiverId: localReceiver?._id || null,
                                        amount: txn.amount,
                                        senderAccount: txn.senderAccount,
                                        receiverUpi: txn.receiverUpi,
                                        status: "SUCCESS",
                                        utr: bankUtr,
                                        note: txn.note || "Reconciled Payment"
                                    });
                                    console.log(`📝 [Recon] Local matching record created: ${localTxn._id}`);
                                } else {
                                    console.log(`ℹ️ [Recon] Local record for UTR ${bankUtr} already exists.`);
                                }
                            } catch (metaErr) {
                                console.warn(`⚠️ [Recon] Local record creation issue:`, metaErr.message);
                            }

                            // B. Update local balance if account exists (Receiver)
                            if (localReceiver) {
                                const receiverAccount = await Account.findOne({ userId: localReceiver._id });
                                if (receiverAccount) {
                                    receiverAccount.balance += Number(txn.amount);
                                    await receiverAccount.save();
                                    console.log(`💰 [Recon] Updated local receiver balance (+₹${txn.amount})`);
                                }

                                // C. Send Notifications to Receiver
                                try {
                                    sendEmail(
                                        localReceiver.email,
                                        "Delayed Payment Reconciled ✅",
                                        `<h2>Payment Reconciled</h2><p>₹${txn.amount} has been credited to your account.</p><p><b>Bank UTR:</b> ${bankUtr}</p>`
                                    ).catch(e => console.error(`❌ [Recon] Receiver Email fail:`, e.message));
                                } catch (e) {
                                    console.error(`❌ [Recon] Receiver Email fail:`, e.message);
                                }

                                if (localReceiver.pushSubscription) {
                                    try {
                                        sendPushNotification(localReceiver.pushSubscription, {
                                            title: "Payment Reconciled ✅",
                                            body: `Reconciliation identified! You received ₹${txn.amount} from ${txn.senderId?.fullName || 'a sender'}.`,
                                            icon: "/logo192.png",
                                            data: { url: "/dashboard" }
                                        }).then(() => console.log(`✅ [Recon] Push notification delivered to receiver.`))
                                          .catch(pe => console.error(`❌ [Recon] Receiver Push fail:`, pe.message));
                                    } catch (pe) {
                                        console.error(`❌ [Recon] Receiver Push fail:`, pe.message);
                                    }
                                }
                            }

                            // D. Send Notifications to Sender
                            if (localSender) {
                                try {
                                    sendEmail(
                                        localSender.email,
                                        "Delayed Payment Successful ✅",
                                        `<h2>Payment Reconciled</h2><p>Your pending payment of ₹${txn.amount} to ${txn.receiverUpi} succeeded.</p><p><b>Bank UTR:</b> ${bankUtr}</p>`
                                    ).catch(e => console.error(`❌ [Recon] Sender Email fail:`, e.message));
                                } catch (e) {
                                    console.error(`❌ [Recon] Sender Email fail:`, e.message);
                                }

                                if (localSender.pushSubscription) {
                                    try {
                                        sendPushNotification(localSender.pushSubscription, {
                                            title: "Payment Reconciled ✅",
                                            body: `Reconciliation identified! Your payment of ₹${txn.amount} to ${txn.receiverUpi} was successful.`,
                                            icon: "/logo192.png",
                                            data: { url: "/dashboard" }
                                        }).then(() => console.log(`✅ [Recon] Push notification delivered to sender.`))
                                          .catch(pe => console.error(`❌ [Recon] Sender Push fail:`, pe.message));
                                    } catch (pe) {
                                        console.error(`❌ [Recon] Sender Push fail:`, pe.message);
                                    }
                                }
                            }
                        }
                    } else if (bankResponse.data && bankResponse.data.failed) {
                         // Optional: Handle failure sycing if needed
                         console.log(`❌ [Recon] Bank flagged Txn ${txn._id} as FAILED.`);
                    }
                } catch (txnError) {
                    console.error(`❌ [Recon] Error for txn ${txn._id}:`, txnError.message);
                }
            }
        } catch (error) {
            if (error.code !== 'ECONNRESET') {
                 console.error("🔥 [Cron] Bridge Error:", error.message);
            }
        }
    });
};