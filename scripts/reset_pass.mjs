import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const RecoUserSchema = new mongoose.Schema({}, { strict: false });
const RecoUser = mongoose.model("RecoUser", RecoUserSchema, "recousers");

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI + "/reco_service_db");
    console.log("✅ Connected to reco_service_db");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    const user = await RecoUser.findOne({ email: adminEmail });
    if (!user) {
        console.log(`❌ User not found. Creating new user [${adminEmail}]...`);
        const hashed = await bcrypt.hash(adminPassword, 10);
        await RecoUser.create({
            fullName: "Admin User",
            email: adminEmail,
            phoneNumber: "0000000000",
            password: hashed
        });
        console.log(`✅ Created new user with email: ${adminEmail}`);
    } else {
        console.log(`Found user: ${user.email}`);
        const hashed = await bcrypt.hash(adminPassword, 10);
        user.password = hashed;
        await user.save();
        console.log(`✅ Password reset for: ${adminEmail}`);
    }
    mongoose.disconnect();
};
run().catch(e => { console.error(e.message); process.exit(1); });
