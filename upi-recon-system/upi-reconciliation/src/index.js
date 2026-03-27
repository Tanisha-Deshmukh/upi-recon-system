import "./loadEnv.js"; // 👈 CRITICAL: Must be first to load .env before other imports
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/index.js";
import { startReconciliationJob } from "./cron/reconciliation.cron.js";
import { ApiResponse } from "./utils/ApiResponse.js";

// Import routers
import userRouter from "./routes/user.routes.js";
import recoRouter from "./routes/reco.routes.js";

const app = express();

// --- 1. Middleware ---
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ CRITICAL: JSON Parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// 🔍 DEBUG LOGGER: This will print the body to your terminal
app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log(`[Incoming Request] URL: ${req.url}`);
        console.log(`[Incoming Body]:`, req.body);
    }
    next();
});

// --- 2. Routes ---
app.use("/api/v1/users", userRouter); 
app.use("/api/v1/reco", recoRouter);

// --- 3. 404 Handler ---
app.use((req, res) => {
    res.status(404).json(new ApiResponse(404, null, "Route not found"));
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`[Global Error] ${message}`);
    res.status(statusCode).json(new ApiResponse(statusCode, null, message));
});

// --- 4. Initialization ---
connectDB()
    .then(() => {
        const port = process.env.PORT || 8001;
        app.listen(port, () => {
            console.log(`🚀 Reconciliation Service running on port ${port}`);
        });
        startReconciliationJob();
    })
    .catch((err) => {
        console.error("❌ DB Connection Failed:", err);
        process.exit(1);
    });