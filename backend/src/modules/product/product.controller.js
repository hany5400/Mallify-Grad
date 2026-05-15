import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateAdmin } from '../admins/middleWares/authenticateAdmin.js';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getProductsByFilter } from './product.service.js';

const router = express.Router();

// Multer Config for Product Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/products";
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

// Create product (only store admins for their store)
router.post('/', authenticateAdmin, upload.single('image_url'), async (req, res) => {
  try {
    if (!req.admin || req.admin.admin_type !== 'store')
      throw new Error("Only store admins can add products");

    const productData = {
      ...req.body,
      image_url: req.file ? `uploads/products/${req.file.filename}` : null
    };

    const result = await createProduct(productData, req.admin);
    res.status(201).json({ message: "Product created", result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get all products or by keyword
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { id, keyword, keyvalue } = req.query;

    if (id) {
      const product = await getProductById(id, req.admin);
      if (!product) {
        return res.status(404).json({ error: "Product not found or not authorized" });
      }
      return res.json(product);
    }

    if (keyword && keyvalue) {
      if (keyword === 'product_id') {
        const product = await getProductById(keyvalue, req.admin);
        if (!product) {
          return res.status(404).json({ error: "Product not found or not authorized" });
        }
        return res.json(product);
      }
    }
    
    if (req.query.search) {
        const products = await getProductsByFilter(req.query.search, req.admin);
        return res.json(products);
    }

    const products = await getAllProducts(req.admin, req.query.store_id);
    res.json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await getProductById(req.params.id, req.admin);
    if (!product) return res.status(404).json({ error: "Product not found or not authorized" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update product (only store admins for their products)
router.put('/:id', authenticateAdmin, upload.single('image_url'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image_url = `uploads/products/${req.file.filename}`;
    } else if (req.body.image_url === undefined) {
      // Remove it so the model doesn't see it (preserving existing value)
      delete updateData.image_url;
    }

    const result = await updateProduct(req.params.id, updateData, req.admin);
    res.json({ message: "Product updated", result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete product (store admin can delete own, mall admin can delete any)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const result = await deleteProduct(req.params.id, req.admin);
    res.json({ message: "Product deleted", result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;