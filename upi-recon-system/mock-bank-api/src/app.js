// src/app.js
import express from "express";
import cors from "cors";
import bankRouter from "./routes/bank.routes.js";

const app = express();
app.use((req, res, next) => {
    console.log(`Bank received: ${req.method} ${req.url}`);
    next();
});
app.use(cors());//By default, browsers have a security rule that prevents a website (like your frontend on localhost:5173) from talking to a server on a different "origin"//This line tells your server, "It's okay to accept requests from other origins." Without this, your React frontend would get a "CORS Error" every time it tried to call your API.

app.use(express.json({ limit: "16kb" })); //This is the "Translator" for JSON data.=>The Need: When you send data from Postman or a frontend using JSON, it arrives at the server as a stream of text.=>The Action: This middleware looks at that text, recognizes it as JSON, and converts it into a JavaScript object.//req.body: This is the reason you can write const { accountNumber } = req.body; in your controller. Without this line, req.body would be undefined.
app.use(express.urlencoded({ extended: true, limit: "16kb" }));//This is the "Translator" for URL data...The Need: Sometimes data is sent via the URL itself (like when you submit a traditional HTML form)...The Action: It handles data that looks like name=tanisha&amount=500.....extended: true: This allows the server to parse "nested" objects (objects inside objects), making it more flexible.

app.use("/api/v1/bank", bankRouter);

export { app };