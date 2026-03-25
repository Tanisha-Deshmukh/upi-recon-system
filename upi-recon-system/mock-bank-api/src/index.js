import dotenv from "dotenv";
import { app } from "./app.js";
import mongoose from "mongoose";

dotenv.config();

const startServer = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n🏦 Bank DB Connected! Host: ${connectionInstance.connection.host}`);
        
        app.listen(process.env.PORT || 5000, () => {
            console.log(`🚀 Bank Server is running at port : ${process.env.PORT || 5000}`);
            
        });
    } catch (error) {
        console.error("MONGODB CONNECTION ERROR:", error);
        process.exit(1);
    }
};

startServer();