import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { RecoUser } from "../models/recoUser.model.js";

export const verifyJWT = AsyncHandler(async (req, res, next) => {
    try {
        console.log(`[Auth Debug] Cookies Received:`, req.cookies);
        const token = req.cookies?.recoAccessToken || req.header("Authorization")?.replace(/^Bearer\s+/i, "");
        console.log(`[Auth Debug] Token Found:`, token ? "YES" : "NO");
        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Find User in DB
        const user = await RecoUser.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid Access Token: User not found");
        }
        
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});