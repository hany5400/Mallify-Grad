import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateUser } from '../../middleware/auth.js';
import { submitStoreAdminRequest, submitMallAdminRequest } from './roleRequests.service.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/documents";
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// Fields for upload
const uploadFields = [
    { name: 'commercial_license', maxCount: 1 },
    { name: 'identification_document', maxCount: 1 }
];

// Submit Store Admin Request
router.post('/store', authenticateUser, upload.fields(uploadFields), async (req, res) => {
    try {
        const { invite_code } = req.body;
        if (!req.files['commercial_license'] || !req.files['identification_document']) {
            return res.status(400).json({ message: "Both commercial license and identification document are required" });
        }

        const data = {
            commercial_license: req.files['commercial_license'][0].path,
            identification_document: req.files['identification_document'][0].path,
            invite_code: invite_code
        };

        const result = await submitStoreAdminRequest(req.user.id, data);
        res.status(201).json({ ok: true, message: "Store admin request submitted successfully", data: result });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Submit Mall Admin Request
router.post('/mall', authenticateUser, upload.fields(uploadFields), async (req, res) => {
    try {
        const { invite_code } = req.body;
        if (!req.files['commercial_license'] || !req.files['identification_document']) {
            return res.status(400).json({ message: "Both commercial license and identification document are required" });
        }

        const data = {
            commercial_license: req.files['commercial_license'][0].path,
            identification_document: req.files['identification_document'][0].path,
            invite_code: invite_code
        };

        const result = await submitMallAdminRequest(req.user.id, data);
        res.status(201).json({ ok: true, message: "Mall admin request submitted successfully", data: result });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

export default router;
