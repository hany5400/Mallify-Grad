import express from 'express';
import { authenticateUser } from '../users/middleWaresUsers/authenticateUser.js';
import { authenticateAdmin } from '../admins/middleWares/authenticateAdmin.js';
import { checkAdminType } from '../admins/middleWares/checkAdminType.js';
import {
    createUserRequest,
    getAllUserRequests,
    getUserRequestById,
    getUserRequestByFilter,
    getUserRequestsByFilterForUser,
    updateUserRequest,
    deleteUserRequest,
    getUserRequestsByUserId,
    findMatches,
    finalSubmit,
    getUserHistory,
    checkAndLogSearch
} from './userRequest.service.js';

const router = express.Router();

// create request
router.post('/', authenticateUser, async (req, res) => {
    try {
        const result = await createUserRequest(req.body, req.user);
        res.status(201).json({ ok: true, message: "User request created", data: result });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// get all users or by keyword
router.get('/', authenticateAdmin, checkAdminType(["mall"]), async (req, res) => {
    try {
        const { id, keyword, keyvalue } = req.query;

        if (id) {
            const request = await getUserRequestById(id);
            if (!request) return res.status(404).json({ error: 'Request not found' });
            return res.json(request);
        }

        if (keyword && keyvalue) {
            if (keyword === 'request_id') {
                const request = await getUserRequestById(keyvalue);
                if (!request) return res.status(404).json({ error: 'Request not found' });
                return res.json(request);
            } else {
                const request = await getUserRequestByFilter(keyword, keyvalue);
                return res.json(request);
            }
        }

        const requests = await getAllUserRequests();

        res.json(requests);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//user see his own requests
router.get('/myRequests', authenticateUser, async (req, res) => {
    try {
        const { keyword, keyvalue } = req.query;

        let data;
        if (keyword && keyvalue) {
            data = await getUserRequestsByFilterForUser(req.user, keyword, keyvalue);
        } else {
            data = await getUserRequestsByUserId(req.user.id);
        }

        res.json({ ok: true, data });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// get history for profile
router.get('/history', authenticateUser, async (req, res) => {
    try {
        const limitParam = req.query.limit;
        const limit = limitParam === 'all' ? null : (limitParam ? parseInt(limitParam) : 3);
        const history = await getUserHistory(req.user.id, limit);
        res.json({ ok: true, data: history });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// get one request
router.get('/:id', authenticateAdmin, checkAdminType(['mall']), async (req, res) => {
    try {
        const data = await getUserRequestById(req.params.id);
        if (!data) return res.status(404).json({ ok: false, message: "User request not found" });
        res.json({ ok: true, data });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});


// update request
router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const data = await updateUserRequest(req.params.id, req.body, req.user);
        res.json({ ok: true, message: "Updated", data });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// delete request
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        await deleteUserRequest(req.params.id, req.user);
        res.json({ ok: true, message: "Deleted successfully" });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// find matches for filtering logic
router.post('/find-matches', authenticateUser, async (req, res) => {
    try {
        const matches = await findMatches(req.body);
        res.json({ ok: true, data: matches });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// handle final submission
router.post('/final-submit', authenticateUser, async (req, res) => {
    try {
        const result = await finalSubmit(req.body, req.user);
        res.json({ ok: true, data: result });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// check subscription limit
router.post('/check-subscription', authenticateUser, async (req, res) => {
    try {
        const result = await checkAndLogSearch(req.user);
        res.json(result);
    } catch (err) {
        if (err.message === 'LIMIT_REACHED') {
            return res.status(403).json({ ok: false, message: 'LIMIT_REACHED' });
        }
        res.status(500).json({ ok: false, message: err.message });
    }
});

export default router;