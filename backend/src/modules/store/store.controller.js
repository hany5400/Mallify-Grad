import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateAdmin } from '../admins/middleWares/authenticateAdmin.js';
import { createStore, getStoresForAdmin, getStoreById, updateStore, deleteStore, getStoresByFilter } from './store.service.js';

const router = express.Router();

// Multer Config for Store Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/stores";
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create only store admins can create a store
router.post('/', authenticateAdmin, upload.single('image_url'), async (req, res) => {
    try {


        if (req.admin.admin_type !== 'store') {
            return res.status(403).json({ message: 'Only store admins can create a store' });
        }
        
        const storeData = {
            ...req.body,
            image_url: req.file ? `uploads/stores/${req.file.filename}` : null,
            user_id: req.admin.id
        };

        const result = await createStore(storeData);
        res.status(201).json({ message: 'Store created', result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get all stores or by keyword
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const { id, keyword, keyvalue } = req.query;

        if (id) {
            const store = await getStoreById(id, req.admin);
            if (!store) return res.status(404).json({ error: 'You can only see your store' });
            return res.json(store);
        }

        if (keyword && keyvalue) {
            if (keyword === 'store_id') {
                const store = await getStoreById(keyvalue, req.admin);
                if (!store) return res.status(404).json({ error: 'You can only see your store' });
                return res.json(store);
            }
        }
        
        if (req.query.search) {
            const stores = await getStoresByFilter(req.query.search, null, req.admin);
            return res.json(stores);
        }

        const stores = await getStoresForAdmin(req.admin);

        if (req.admin.admin_type === 'store' && stores.length === 0) {
            return res.status(403).json({ message: "Mall admin only can view all stores" });
        }

        res.json(stores);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get by id
router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
        const store = await getStoreById(req.params.id, req.admin);
        if (!store) return res.status(404).json({ error: 'You can only see your store' });
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Update store (store admin can update only their own store)
router.put('/:id', authenticateAdmin, upload.single('image_url'), async (req, res) => {
    try {


        if (req.admin.admin_type === 'mall') {
            return res.status(403).json({ message: 'Mall admins cannot update stores' });
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.image_url = `uploads/stores/${req.file.filename}`;
        } else if (req.body.image_url === undefined) {
            // Remove it so the model doesn't see it (preserving existing value)
            delete updateData.image_url;
        }


        const result = await updateStore(req.params.id, updateData, req.admin.id);
        res.json({ message: 'Store updated', result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete store (store admin deletes own store, mall admin can delete any store)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        if (req.admin.admin_type === 'store') {
            const result = await deleteStore(req.params.id, req.admin.id);
            return res.json({ message: 'Your store deleted', result });
        }
        const result = await deleteStore(req.params.id, req.admin.id);
        res.json({ message: 'Store deleted', result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;