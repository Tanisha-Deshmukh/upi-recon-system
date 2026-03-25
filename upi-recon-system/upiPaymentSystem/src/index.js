

import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });

// minimal index file, just db and server spin up
// handled in app.js

// start up everything
connectDB()
    .then(() => {
        const port = process.env.PORT || 8000;
        app.listen(port, () => {
            console.log(`🚀 Reconciliation Service running on port ${port}`);
        });
        console.log("⏱️ Reconciliation Cron Job has been started");
    })
    .catch((err) => {
        console.error("DB Connection Failed:", err);
        process.exit(1);
    });