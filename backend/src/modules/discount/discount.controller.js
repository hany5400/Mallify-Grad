import express from 'express';
import * as DiscountService from './discount.service.js';
import { authenticateAdmin } from '../admins/middleWares/authenticateAdmin.js';

const router = express.Router();

export const createDiscount = async (req, res) => {
    try {
        const result = await DiscountService.createDiscount(req.body, req.admin);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
};

export const getAllDiscounts = async (req, res) => {
    try {
        const result = await DiscountService.getAllDiscounts(req.admin);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
};

export const getPublicDiscounts = async (req, res) => {
    try {
        const result = await DiscountService.getPublicDiscounts();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
};

export const getDiscountById = async (req, res) => {
    try {
        const result = await DiscountService.getDiscountById(req.params.id, req.admin);
        if (!result) return res.status(404).json({ error: 'Discount not found' });
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
};

export const updateDiscount = async (req, res) => {
    try {
        const result = await DiscountService.updateDiscount(req.params.id, req.body, req.admin);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
};

export const deleteDiscount = async (req, res) => {
    try {
        await DiscountService.deleteDiscount(req.params.id, req.admin);
        res.status(200).json({ ok: true, message: 'Discount deleted successfully' });
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
};

// Route Registration
router.post('/', authenticateAdmin, createDiscount);
router.get('/', authenticateAdmin, getAllDiscounts);
router.get('/public', getPublicDiscounts);
router.get('/:id', authenticateAdmin, getDiscountById);
router.put('/:id', authenticateAdmin, updateDiscount);
router.delete('/:id', authenticateAdmin, deleteDiscount);

export default router;