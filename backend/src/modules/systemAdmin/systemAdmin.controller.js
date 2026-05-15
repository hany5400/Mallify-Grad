import express from 'express';
import { authenticateUser, authorizeRole } from '../../middleware/auth.js';
import { 
    fetchAllPendingRequests, 
    approveStoreAdmin, 
    rejectStoreAdmin, 
    approveMallAdmin, 
    rejectMallAdmin,
    fetchMallAdminsEnriched,
    fetchStoreAdminsEnriched
} from './systemAdmin.service.js';
import db from '../../db/connection.js';

const router = express.Router();

// Get all pending requests (System Admin sees all, Mall Admin sees their stores only)
router.get('/pending-requests', authenticateUser, authorizeRole(['system_admin', 'mall_admin']), async (req, res) => {
    try {
        let mallId = null;
        if (req.user.role === 'mall_admin') {
            const [malls] = await db.query('SELECT mall_id FROM mall WHERE user_id = ?', [req.user.id]);
            if (malls.length === 0) return res.json({ ok: true, data: { store: [], mall: [] } });
            mallId = malls[0].mall_id;
        }
        
        const requests = await fetchAllPendingRequests(mallId);
        res.json({ ok: true, data: requests });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Get Mall Admins Overview (Enriched)
router.get('/mall-admins-overview', authenticateUser, authorizeRole(['system_admin']), async (req, res) => {
    try {
        const { search } = req.query;
        const data = await fetchMallAdminsEnriched(search);
        res.json({ ok: true, data });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Get Store Admins Overview (Enriched)
router.get('/store-admins-overview', authenticateUser, authorizeRole(['system_admin']), async (req, res) => {
    try {
        const { search } = req.query;
        const data = await fetchStoreAdminsEnriched(search);
        res.json({ ok: true, data });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Approve Store Admin
router.post('/approve-store/:id', authenticateUser, authorizeRole(['system_admin', 'mall_admin']), async (req, res) => {
    try {
        const requestId = req.params.id;
        
        // Security check for Mall Admins
        if (req.user.role === 'mall_admin') {
            const request = await db.query('SELECT mall_id FROM store_admin_register WHERE store_register_id = ?', [requestId]);
            if (request[0].length === 0) return res.status(404).json({ ok: false, error: "Request not found" });
            
            const [malls] = await db.query('SELECT mall_id FROM mall WHERE user_id = ?', [req.user.id]);
            if (malls.length === 0 || malls[0].mall_id !== request[0][0].mall_id) {
                return res.status(403).json({ ok: false, error: "You can only approve requests for your own mall" });
            }
        }

        await approveStoreAdmin(requestId);
        res.json({ ok: true, message: "Store admin request approved" });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Reject Store Admin
router.post('/reject-store/:id', authenticateUser, authorizeRole(['system_admin', 'mall_admin']), async (req, res) => {
    try {
        const requestId = req.params.id;

        // Security check for Mall Admins
        if (req.user.role === 'mall_admin') {
            const request = await db.query('SELECT mall_id FROM store_admin_register WHERE store_register_id = ?', [requestId]);
            if (request[0].length === 0) return res.status(404).json({ ok: false, error: "Request not found" });
            
            const [malls] = await db.query('SELECT mall_id FROM mall WHERE user_id = ?', [req.user.id]);
            if (malls.length === 0 || malls[0].mall_id !== request[0][0].mall_id) {
                return res.status(403).json({ ok: false, error: "You can only reject requests for your own mall" });
            }
        }

        await rejectStoreAdmin(requestId);
        res.json({ ok: true, message: "Store admin request rejected" });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Approve Mall Admin
router.post('/approve-mall/:id', authenticateUser, authorizeRole(['system_admin']), async (req, res) => {
    try {
        await approveMallAdmin(req.params.id);
        res.json({ ok: true, message: "Mall admin request approved" });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Reject Mall Admin
router.post('/reject-mall/:id', authenticateUser, authorizeRole(['system_admin']), async (req, res) => {
    try {
        await rejectMallAdmin(req.params.id);
        res.json({ ok: true, message: "Mall admin request rejected" });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

export default router;
