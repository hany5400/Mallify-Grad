import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getAllMalls, getMallById, createMall, updateMall, deleteMall, getMallsByFilter } from './mall.service.js';
import { authenticateAdmin } from '../admins/middleWares/authenticateAdmin.js';
import { checkAdminType } from '../admins/middleWares/checkAdminType.js';
import jwt from 'jsonwebtoken';
import { getUserById } from '../../db/models/users.model.js';

const router = express.Router();

// Multer Config for Mall Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/malls";
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `mall-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// create mall
router.post('/', authenticateAdmin, checkAdminType(['mall']), upload.single('image_url'), async (req, res) => {
  try {
    let imageUrl = req.body.image_url;
    if (req.file) {
      imageUrl = req.file.path.replace(/\\/g, '/');
    }
    
    const result = await createMall({
      ...req.body,
      image_url: imageUrl,
      user_id: req.admin.id
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all or by keyword
router.get('/', async (req, res) => {
  try {
    const { id, keyword, keyvalue } = req.query;

    // Check for optional authentication to filter for mall admins
    let filterUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await getUserById(decoded.id);
        if (user && user.role === 'mall_admin') {
          filterUserId = user.id;
        }
      } catch (e) {
        // Ignore invalid token for public access
      }
    }

    if (id) {
      const mall = await getMallById(id);
      if (!mall) return res.status(404).json({ error: 'Mall not found' });
      // Security: If mall admin, check if it's their mall
      if (filterUserId && mall.user_id !== filterUserId) {
          return res.status(403).json({ error: 'You can only view your own mall' });
      }
      return res.json(mall);
    }

    if (keyword && keyvalue) {
      if (keyword === 'mall_id') {
        const mall = await getMallById(keyvalue);
        if (!mall) return res.status(404).json({ error: 'Mall not found' });
        if (filterUserId && mall.user_id !== filterUserId) {
            return res.status(403).json({ error: 'You can only view your own mall' });
        }
        return res.json(mall);
      } else {
        const malls = await getMallsByFilter(keyword, keyvalue);
        if (filterUserId) {
            return res.json(malls.filter(m => m.user_id === filterUserId));
        }
        return res.json(malls);
      }
    }

    const malls = await getAllMalls(filterUserId);
    res.json(malls);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get by id
router.get('/:id', authenticateAdmin, checkAdminType(['mall']), async (req, res) => {
  try {
    const mall = await getMallById(req.params.id);
    if (!mall) return res.status(404).json({ error: 'Mall not found' });
    res.json(mall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//update mall
router.put('/:id', authenticateAdmin, checkAdminType(['mall']), upload.single('image_url'), async (req, res) => {
  try {
    let imageUrl = req.body.image_url;
    if (req.file) {
      imageUrl = req.file.path.replace(/\\/g, '/');
    }

    const user_id = req.admin.id;
    const mall = await updateMall(req.params.id, { ...req.body, image_url: imageUrl, user_id });
    res.json({ message: 'Mall updated successfully', mall });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//delete mall
router.delete('/:id', authenticateAdmin, checkAdminType(['mall']), async (req, res) => {
  try {
    const user_id = req.admin.id;
    await deleteMall(req.params.id, user_id);
    res.json({ message: 'Mall deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;