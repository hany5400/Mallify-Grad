import express from 'express';
import { authenticateUser } from '../users/middleWaresUsers/authenticateUser.js';
import { authenticateAdmin } from '../admins/middleWares/authenticateAdmin.js';
import { checkAdminType } from '../admins/middleWares/checkAdminType.js';
import {
    createResult,
    getAllResults,
    getResultById,
    updateResult,
    deleteResult,
    getMyResults,
    getResultsByFilter
} from './result.service.js';

const router = express.Router();

// create result
router.post('/', authenticateUser, async (req, res) => {
    try {
        const result = await createResult(req.user, req.body);
        res.status(201).json({ ok: true, message: "Result created", data: result });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// get all results (admin only)
router.get('/', authenticateAdmin, checkAdminType(["mall"]), async (req, res) => {
    try {
        const { keyword, keyvalue } = req.query;

        let results;
        if (keyword && keyvalue) {
            results = await getResultsByFilter(keyword, keyvalue);
        } else {
            results = await getAllResults();
        }

        res.json({ ok: true, data: results });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// user sees only his results with optional filter
router.get('/myresults', authenticateUser, async (req, res) => {
    try {
        const { keyword, keyvalue } = req.query;
        const results = await getMyResults(req.user, keyword, keyvalue);
        res.json({ ok: true, data: results });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// get result by id (admin)
router.get('/:id', authenticateAdmin, checkAdminType(["mall"]), async (req, res) => {
    try {
        const result = await getResultById(req.params.id);
        res.json({ ok: true, data: result });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// update result (user)
router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const updated = await updateResult(req.user, req.params.id, req.body);
        res.json({ ok: true, message: "Result updated", data: updated });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// delete result (user)
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        await deleteResult(req.user, req.params.id);
        res.json({ ok: true, message: "Result deleted successfully" });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

export default router;