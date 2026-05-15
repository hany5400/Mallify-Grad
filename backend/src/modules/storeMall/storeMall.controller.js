import express from 'express';
import { authenticateAdmin } from '../admins/middleWares/authenticateAdmin.js';
import { checkAdminType} from '../admins/middleWares/checkAdminType.js';
import { 
    addStoreToMall, removeStoreFromMall, listStoreIdsInMall, listMallIdsForStore, 
    updateStoreInMall, getLinksByKeyword,
    requestStoreAssignment, getPendingAssignments, updateAssignmentStatus
} from './storeMall.service.js';

const router = express.Router();

// create link between store and mall
router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const { store_id, mall_id } = req.body;

        const result = await addStoreToMall(store_id, mall_id, req.admin.id);
        res.status(201).json({ message: "Store linked to mall", result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

});

// get all stores in a mall
router.get('/store/:mall_id', async (req, res) => {
    try {
        const stores = await listStoreIdsInMall(req.params.mall_id);
        res.json(stores);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// get all malls for a store
router.get('/mall/:store_id', async (req, res) => {
    try {
        const malls = await listMallIdsForStore(req.params.store_id);
        res.json(malls);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// get links by keyword
router.get('/', authenticateAdmin, checkAdminType(["mall"]), async (req, res) => {
    try {
        const { keyword, keyvalue } = req.query;
        const result = await getLinksByKeyword(keyword, keyvalue);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// update link between store and mall
router.put('/', authenticateAdmin, async (req, res) => {
    try {
        const { old_store_id, old_mall_id, new_store_id, new_mall_id } = req.body;
        const result = await updateStoreInMall(old_store_id, old_mall_id, new_store_id, new_mall_id, req.admin.id);
        res.json({ message: "Store-Mall link updated", result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// delete link between store and mall
router.delete('/', authenticateAdmin, async (req, res) => {
    try {
        const { store_id, mall_id } = req.body;
        const result = await removeStoreFromMall(store_id, mall_id, req.admin.id);
        res.json({ message: "Store unlinked from mall", result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// -------------- NEW ASSIGNMENT WORKFLOW --------------

// Create a pending request
router.post('/requests', authenticateAdmin, async (req, res) => {
    try {
        const { store_id, mall_id } = req.body;
        const result = await requestStoreAssignment(store_id, mall_id, req.admin.id);
        res.status(201).json({ message: "Assignment request sent", result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get pending requests
router.get('/requests', authenticateAdmin, async (req, res) => {
    try {
        const result = await getPendingAssignments(req.admin.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Approve or reject a request
router.put('/requests/:store_id/:mall_id/:action', authenticateAdmin, async (req, res) => {
    try {
        const { store_id, mall_id, action } = req.params;
        const status = action === 'approve' ? 'approved' : 'rejected';
        const result = await updateAssignmentStatus(store_id, mall_id, status, req.admin.id);
        res.json({ message: `Assignment ${status}`, result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;