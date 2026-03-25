import mongoose from "mongoose";
import { DB_name } from "../constants.js";

export const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
        console.log(`\n Mongodb connected !! DB HOST: ${connectionInstance.connect.host}`)
   } catch (error) {
        console.log("MONGODB CONNECTION ERRPR", error);
        process.exit(1)
    }
}