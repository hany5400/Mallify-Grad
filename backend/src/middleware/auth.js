import jwt from "jsonwebtoken";
import { getUserById } from "../db/models/users.model.js";

export const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        // Try admin secret first, then user secret
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || "mallify_secret_key");
        } catch (e) {
            decoded = jwt.verify(token, "your_secret_key_here");
        }
        
        const user = await getUserById(decoded.id);
        if (!user) return res.status(401).json({ message: "User not found" });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }
        next();
    };
};
