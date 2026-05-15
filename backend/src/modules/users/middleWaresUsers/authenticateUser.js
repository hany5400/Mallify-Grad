import jwt from 'jsonwebtoken';
import { getUserById } from '../../../db/models/users.model.js';


export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ ok: false, message: "No token provided" });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_USERS);
    req.user = await getUserById(decoded.id);
    if (!req.user) return res.status(401).json({ ok: false, message: "User not found" });
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
};