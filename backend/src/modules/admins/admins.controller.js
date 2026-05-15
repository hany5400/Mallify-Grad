import express from 'express';
import { createAdmin, getAllAdmins, getAdminById, updateAdmin, deleteAdmin, getAdminsByFilter, getStats } from './admins.service.js';
import { authenticateAdmin } from './middleWares/authenticateAdmin.js';
import { checkAdminType } from './middleWares/checkAdminType.js';

const router = express.Router();

// get stats
router.get('/stats', authenticateAdmin, checkAdminType(['mall', 'store', 'system']), async (req, res) => {
    try {
        const stats = await getStats(req.admin);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// create admin (Mall Admin or System Admin)
router.post('/', authenticateAdmin, checkAdminType(['mall', 'system']), async (req, res) => {
    try {
        const result = await createAdmin(req.body);
        res.status(201).json({ message: 'Admin created', result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get all admins or by keyword
router.get('/', authenticateAdmin, checkAdminType(['mall']), async (req, res) => {
    try {
        const { id, keyword, keyvalue, type, search } = req.query;
        if (id) {
            const admin = await getAdminById(id);
            if (!admin) return res.status(404).json({ error: 'Admin not found' });
            return res.json(admin);
        }

        if (type || search) {
            // Priority: if keyword/keyvalue are sent (old way), use them. 
            // Better: use type and search if provided.
            const filterKey = type ? 'admin_type' : keyword;
            const filterVal = type ? type : keyvalue;
            const admins = await getAdminsByFilter(filterKey, filterVal, search);
            return res.json(admins);
        }

        if (keyword && keyvalue) {
            const admins = await getAdminsByFilter(keyword, keyvalue);
            return res.json(admins);
        }
        const admins = await getAllAdmins();
        res.json(admins);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// get admin by id
router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.admin.admin_type !== 'mall' && req.admin.id !== Number(id)) {
            return res.status(403).json({ message: "You can only access your own account" });
        }

        const admin = await getAdminById(id);
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// update admin
router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.admin.admin_type !== 'mall' && req.admin.id !== Number(id)) {
            return res.status(403).json({ message: "You can only update your own account" });
        }

        const existingAdmin = await getAdminById(id);
        if (!existingAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const updatedData = {
            name: req.body.name ?? existingAdmin.name,
            email: req.body.email ?? existingAdmin.email,
            password: req.body.password ?? existingAdmin.password,
            admin_type: req.body.admin_type ?? existingAdmin.admin_type
        };

        const result = await updateAdmin(id, updatedData);

        res.json({ message: "Admin updated", result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// delete admin
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.admin.admin_type !== 'mall' && req.admin.id !== Number(id)) {
            return res.status(403).json({ message: "You can only delete your own account" });
        }

        const result = await deleteAdmin(id);
        res.json({ message: 'Admin deleted', result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;