import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createProductCategory, getAllProductCategories, getProductCategoryById, updateProductCategory, deleteProductCategory, getProductCategoryByFilter } from './productCategory.service.js';
import { authenticateAdmin } from '../admins/middleWares/authenticateAdmin.js';

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/categories';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });


const router = express.Router();

// create category (store admin only)
router.post('/', authenticateAdmin, upload.single('image_url'), async (req, res) => {
    try {
        const data = {
            ...req.body,
            image_url: req.file ? `uploads/categories/${req.file.filename}` : null
        };
        const result = await createProductCategory(data, req.admin);
        res.status(201).json({ ok: true, message: "Category created", data: result });
    } catch (err) {
        res.status(403).json({ ok: false, message: err.message });
    }
});


// get all categories or by filter
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const { id, keyword, keyvalue } = req.query;

        if (id) {
            const productCategory = await getProductCategoryById(id, req.admin);
            if (!productCategory) {
                return res.status(404).json({ error: "Product category not found or not authorized" });
            }
            return res.json(productCategory);
        }

        if (keyword && keyvalue) {
            if (keyword === 'product_category_id') {
                const productCategory = await getProductCategoryById(keyvalue, req.admin);
                if (!productCategory) {
                    return res.status(404).json({ error: "Product category not found or not authorized" });
                }
                return res.json(productCategory);
            }
        }
        
        if (req.query.search) {
            const productCategory = await getProductCategoryByFilter(req.query.search, req.admin);
            return res.json(productCategory);
        }

        const productCategory = await getAllProductCategories(req.admin, req.query.product_id, req.query.skipDiscounted === 'true');
        res.json(productCategory);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get category by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
        const category = await getProductCategoryById(req.params.id, req.admin);
        if (!category) return res.status(404).json({ ok: false, message: "Category not found or not authorized" });
        res.json({ ok: true, data: category });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});



// update category (store admin only)
router.put('/:id', authenticateAdmin, upload.single('image_url'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image_url = `uploads/categories/${req.file.filename}`;
        }
        const result = await updateProductCategory(req.params.id, updateData, req.admin);
        res.json({ ok: true, message: "Category updated", data: result });
    } catch (err) {
        res.status(403).json({ ok: false, message: err.message });
    }
});


// delete category (store admin for own products, mall admin any)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        await deleteProductCategory(req.params.id, req.admin);
        res.json({ ok: true, message: "Category deleted" });
    } catch (err) {
        res.status(403).json({ ok: false, message: err.message });
    }
});

export default router;