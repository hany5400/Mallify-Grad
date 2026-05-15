import jwt from "jsonwebtoken";
import { getUserById } from "../../../db/models/users.model.js";

export const authenticateAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const secret = process.env.JWT_SECRET || "mallify_secret_key";
        const decoded = jwt.verify(token, secret);

        const user = await getUserById(decoded.id);
        
        // Check if user exists and has an admin role
        const adminRoles = ['system_admin', 'mall_admin', 'store_admin'];
        if (!user || !adminRoles.includes(user.role)) {
            return res.status(401).json({ message: "Admin not found or unauthorized" });
        }

        // For backward compatibility with existing code that expects admin_type
        user.admin_type = user.role === 'mall_admin' ? 'mall' : 
                         user.role === 'store_admin' ? 'store' : 'system';
        
        req.user = user;
        req.admin = user;
        next();
    } catch (err) {
        console.error("Auth error:", err.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};