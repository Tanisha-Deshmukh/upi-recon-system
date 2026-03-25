

import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = AsyncHandler(async (req, _, next) => {
    try {
        console.log(`[UPI Auth Debug] Cookies Received:`, req.cookies);
        const token = req.cookies?.fastpayAccessToken || req.header("Authorization")?.replace(/^Bearer\s+/i, "");
        console.log(`[UPI Auth Debug] Token Found:`, token ? "YES" : "NO");

        if (!token) {throw new ApiError(401, "Unauthorized request");} // fixed capitalization

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) throw new ApiError(401, "Invalid Access Token");

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});