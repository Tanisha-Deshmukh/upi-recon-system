import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js"; 
import userRouter from "./routes/user.routes.js";
import paymentRouter from "./routes/payment.routes.js";

const app = express();

const allowedOrigins = [
    process.env.CORS_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://paysync-frontend.onrender.com"
];

// cors setup - allows react frontends
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import recoRouter from "./routes/reco.routes.js";
import upiRouter from "./routes/upi.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/reco", recoRouter);
app.use("/api/v1/upi", upiRouter);

// global catch all
app.use(errorHandler); 

export { app };