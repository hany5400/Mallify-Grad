import express from 'express';
import { authenticateUser } from '../users/middleWaresUsers/authenticateUser.js';
import { authenticateAdmin } from '../admins/middleWares/authenticateAdmin.js';
import { checkAdminType } from '../admins/middleWares/checkAdminType.js';
import {
    createUserRequestStorage,
    getAllUserRequestStorage,
    getStorageByRequestId,
    getStorageByProductId,
    getStorageByStoreId,
    getMyStorage,
    updateUserRequestStorage,
    deleteUserRequestStorage
} from './userRequestStorage.service.js';
import e from 'express';

const router = express.Router();

// create storage
router.post("/", authenticateUser, async (req, res) => {
    try {
        const data = await createUserRequestStorage(req.user, req.body);
        res.status(201).json({ ok: true, message: "Storage created", data });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// get all storage (admin)
router.get("/", authenticateAdmin, checkAdminType(['mall']), async (req, res) => {
    try {
        const { keyword, keyvalue } = req.query;

        let data;

        if (keyword && keyvalue) {
            if (keyword === "request_id") {
                data = await getStorageByRequestId(keyvalue);
            } else if (keyword === "product_id") {
                data = await getStorageByProductId(keyvalue);
            } else if (keyword === "store_id") {
                data = await getStorageByStoreId(keyvalue);
            } else {
                throw new Error("Invalid filter field");
            }
        } else {
            data = await getAllUserRequestStorage();
        }

        res.json({ ok: true, data });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// get storage by request
router.get("/request/:request_id", authenticateAdmin, checkAdminType(['mall']), async (req, res) => {
    try {
        const data = await getStorageByRequestId(req.params.request_id);
        res.json({ ok: true, data });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// get storage by product
router.get("/product/:product_id", authenticateAdmin, checkAdminType(['mall']), async (req, res) => {
    try {
        const data = await getStorageByProductId(req.params.product_id);
        res.json({ ok: true, data });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// get storage by store
router.get("/store/:store_id", authenticateAdmin, checkAdminType(['mall']), async (req, res) => {
    try {
        const data = await getStorageByStoreId(req.params.store_id);
        res.json({ ok: true, data });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// user sees only his storage
router.get("/myStorage", authenticateUser, async (req, res) => {
    try {
        const { keyword, keyvalue } = req.query;
        const data = await getMyStorage(req.user, keyword, keyvalue);
        res.json({ ok: true, data });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});


// update storage
router.put('/', authenticateUser, async (req, res) => {
    try {
        const { request_id, store_id, product_id, new_request_id, new_store_id, new_product_id } = req.body;

        const result = await updateUserRequestStorage(
            req.user,
            { request_id, store_id, product_id },
            { new_request_id, new_store_id, new_product_id }
        );

        res.json({ ok: true, message: "Updated", result });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// delete storage
router.delete('/', authenticateUser, async (req, res) => {
    try {
        const { request_id, product_id, store_id } = req.body;

        await deleteUserRequestStorage(req.user, request_id, product_id, store_id);

        res.json({ ok: true, message: "Deleted" });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

export default router;