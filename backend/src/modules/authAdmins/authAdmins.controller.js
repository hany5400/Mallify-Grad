import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateAdmin } from "../admins/middleWares/authenticateAdmin.js";
import { 
  loginAdmin, 
  meAdmin, 
  registerStoreAdmin,
  registerMallAdmin,
  getAllStoreRequestsAdmin,
  approveStoreRequestAdmin,
  rejectStoreRequestAdmin,
  verifyStoreCode,
  verifyMallCode 
} from "./authAdmins.service.js";

const router = express.Router();

// Test Route
router.get("/test", (req, res) => {
  res.send("Admin Auth module working");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/admin_requests";
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Mall Admin Register (multipart)
router.post("/register/mall", upload.fields([
  { name: 'commercial_license', maxCount: 1 },
  { name: 'identification_document', maxCount: 1 }
]), registerMallAdmin);

// Store Admin Register (multipart)
router.post("/register/store", upload.fields([
  { name: 'commercial_license', maxCount: 1 },
  { name: 'identification_document', maxCount: 1 }
]), registerStoreAdmin);

// Mall Admin Store Requests endpoints
router.get("/requests", authenticateAdmin, getAllStoreRequestsAdmin);
router.put("/requests/:id/approve", authenticateAdmin, approveStoreRequestAdmin);
router.put("/requests/:id/reject", authenticateAdmin, rejectStoreRequestAdmin);

// Code Verification Endpoints
router.post("/verify-code", verifyStoreCode);
router.post("/verify-mall-code", verifyMallCode);

// Login just for mall admins
router.post("/login", loginAdmin);

// Get admin info
router.get("/me/:id", meAdmin);


export default router;