import mongoose from "mongoose";
import { BankAccount } from "./models/bankAccount.model.js";
import { Bank } from "./models/bank.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedBank = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // wipe db before seeding
        await BankAccount.deleteMany({});
        await Bank.deleteMany({});

        console.log("Creating Major Indian Banks...");
        
        // inserting major banks
        const banksToCreate = [
            { name: "State Bank of India", shortName: "SBI", ifscPrefix: "SBIN" },
            { name: "Punjab National Bank", shortName: "PNB", ifscPrefix: "PUNB" },
            { name: "Bank of Baroda", shortName: "BOB", ifscPrefix: "BARB" },
            { name: "Union Bank of India", shortName: "UBI", ifscPrefix: "UBIN" },
            { name: "Canara Bank", shortName: "CANARA", ifscPrefix: "CNRB" },
            { name: "HDFC Bank", shortName: "HDFC", ifscPrefix: "HDFC" },
            { name: "ICICI Bank", shortName: "ICICI", ifscPrefix: "ICIC" },
            { name: "Axis Bank", shortName: "AXIS", ifscPrefix: "UTIB" },
            { name: "Kotak Mahindra Bank", shortName: "KOTAK", ifscPrefix: "KKBK" }
        ];

        await Bank.insertMany(banksToCreate);

        // grab mongo ids for the test accounts
        const sbi = await Bank.findOne({ shortName: "SBI" });
        const hdfc = await Bank.findOne({ shortName: "HDFC" });

        console.log("Creating Test Accounts...");
        
        // creating fake user accounts
        await BankAccount.create([
            {
                bankId: sbi._id, 
                accountNumber: "1234567890",
                ifsc: "SBIN0001234",
                phoneNumber: "9876543210",
                balance: 50000,
                holderName: "Tanishq",
                pin: "1122" 
            },
            {
                bankId: hdfc._id, 
                accountNumber: "0987654321",
                ifsc: "HDFC0005678",
                phoneNumber: "9123456789",
                balance: 10000,
                holderName: "Rahul",
                pin: "3344" 
            },
            {
                bankId: sbi._id, 
                accountNumber: "987654321011", 
                ifsc: "SBIN0001234",
                phoneNumber: "9876543210",
                balance: 50000,
                holderName: "Tanisha",
                pin: "1122" 
            },
            {
                bankId: sbi._id,
                accountNumber: "7798216447",
                ifsc: "SBI10101010",
                phoneNumber: "7796074611",
                balance: 100000,
                holderName: "Tanisha Deshmukh",
                pin: "1122"
            }
        ]);

        console.log("✅ Mock Bank Seeded: Banks and Test accounts created successfully");
        process.exit();
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedBank();