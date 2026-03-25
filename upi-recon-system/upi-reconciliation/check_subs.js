import mongoose from 'mongoose';

// Connect to the reconciliation DB
const dbUri = "mongodb+srv://tanisha:tanisha123@tanisha1.lm3j7nj.mongodb.net/reco_service_db";

async function check() {
    try {
        await mongoose.connect(dbUri);
        // Access 'recousers' collection directly
        const users = await mongoose.connection.collection('recousers').find({ 
            pushSubscription: { $exists: true, $ne: null } 
        }).toArray();
        
        console.log(`Found ${users.length} users with push subscriptions.`);
        users.forEach(u => {
            console.log(`- ${u.email}: ${JSON.stringify(u.pushSubscription).substring(0, 50)}...`);
        });
    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

check();
