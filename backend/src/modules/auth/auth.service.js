import jwt from "jsonwebtoken";
import {
    createUser as createUserModel,
    getUserByEmail as getUserByEmailModel,
    getUserById as getUserByIdModel
} from "../../db/models/users.model.js";
import { createSubscription } from "../../db/models/subscriptions.model.js";
import { getAdminByEmail } from "../../db/models/admins.model.js";
import { getStoreRequestByUserId } from "../../db/models/storeRequestModel.js";

const allowedGenders = ["male", "female"];

// Register user
export const register = async (req, res, next) => {
    try {
        let { name, email, password, gender, DOB } = req.body;

        if (!name || !email || !password || !gender) {
            return res.status(400).json({ ok: false, message: "Missing required fields" });
        }

        email = String(email).trim().toLowerCase();
        gender = String(gender).toLowerCase().trim();

        if (!allowedGenders.includes(gender)) {
            return res.status(400).json({ ok: false, message: "Invalid gender. Allowed: male, female" });
        }

        const existingUser = await getUserByEmailModel(email);
        if (existingUser) {
            return res.status(409).json({ ok: false, message: "Email already exists" });
        }

        const userCode = name.slice(0, 2).toUpperCase() + Math.floor(100 + Math.random() * 900);

        const user = await createUserModel({ name, password, gender, DOB, email, userCode, points: 0, role: 'user' });

        // Assign default free subscription
        await createSubscription({
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
            start_date: new Date().toISOString().split('T')[0] // current date
        });

        return res.status(201).json({ ok: true, message: "User registered successfully", data: user });

    } catch (err) {
        next(err);
    }
};


// Login user
export const login = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        email = String(email).trim().toLowerCase();

        const user = await getUserByEmailModel(email);
        if (!user || user.password !== password) {
            return res.status(401).json({ ok: false, message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            "your_secret_key_here",
            { expiresIn: "1h" }
        );

        // Check roles
        if (user.role && user.role !== 'user') {
            return res.json({
                ok: true,
                message: "Login successful",
                data: user,
                role: user.role, // Use the role directly or map it if needed
                requires_verification_code: false,
                token
            });
        }

        return res.json({
            ok: true,
            message: "Login successful",
            data: user,
            token
        });

    } catch (err) {
        next(err);
    }
};

// Get user info
export const me = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await getUserByIdModel(id);
        if (!user) return res.status(404).json({ ok: false, message: "User not found" });

        return res.json({ ok: true, data: user });
    } catch (err) {
        next(err);
    }
};