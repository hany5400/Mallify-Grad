import { getPendingStoreRequests, updateStoreRequestStatus, getStoreRequestById } from "../../db/models/storeAdminRegister.model.js";
import { getPendingMallRequests, updateMallRequestStatus, getMallRequestById } from "../../db/models/mallAdminRegister.model.js";
import { updateUserRole, getUserById, deleteUser } from "../../db/models/users.model.js";
import { createAdmin } from "../../db/models/admins.model.js";
import db from "../../db/connection.js";
import nodemailer from "nodemailer";

export const fetchAllPendingRequests = async (mallId = null) => {
    const storeRequests = await getPendingStoreRequests(mallId);
    
    // System admins see all mall requests, Mall admins see none (they only manage their own stores)
    const mallRequests = mallId ? [] : await getPendingMallRequests();
    
    return {
        store: storeRequests,
        mall: mallRequests
    };
};

export const fetchMallAdminsEnriched = async (search = '') => {
    // Get mall admins, their malls, and assigned stores to allow deep search
    let query = `
        SELECT DISTINCT u.user_id, u.name as admin_name, u.email, u.user_code
        FROM users u
        LEFT JOIN mall m ON u.user_id = m.user_id
        LEFT JOIN store_mall sm ON m.mall_id = sm.mall_id
        LEFT JOIN store s ON sm.store_id = s.store_id
        WHERE u.role = 'mall_admin'
    `;
    
    const params = [];
    if (search) {
        query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.user_code LIKE ? OR m.mall_name LIKE ? OR s.store_name LIKE ?)`;
        const p = `%${search}%`;
        params.push(p, p, p, p, p);
    }

    const [adminsRows] = await db.query(query, params);
    
    const admins = [];
    for (const row of adminsRows) {
        const admin = {
            id: row.user_id,
            name: row.admin_name,
            email: row.email,
            user_code: row.user_code,
            malls: []
        };

        // Get this admin's malls
        const [malls] = await db.query(`SELECT mall_id, mall_name, image_url FROM mall WHERE user_id = ?`, [admin.id]);
        
        for (const mall of malls) {
            const [stores] = await db.query(`
                SELECT s.store_id, s.store_name, s.image_url, s.brand_tier, u.name as owner_name
                FROM store s
                JOIN store_mall sm ON s.store_id = sm.store_id
                JOIN users u ON s.user_id = u.user_id
                WHERE sm.mall_id = ? AND sm.status = 'approved'
            `, [mall.mall_id]);
            
            admin.malls.push({
                id: mall.mall_id,
                name: mall.mall_name,
                image: mall.image_url,
                stores: stores
            });
        }
        admins.push(admin);
    }

    return admins;
};

export const fetchStoreAdminsEnriched = async (search = '') => {
    // Get store admins, their stores, and products to allow deep search
    let query = `
        SELECT DISTINCT u.user_id, u.name as admin_name, u.email, u.user_code
        FROM users u
        LEFT JOIN store s ON u.user_id = s.user_id
        LEFT JOIN product p ON s.store_id = p.store_id
        WHERE u.role = 'store_admin'
    `;

    const params = [];
    if (search) {
        query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.user_code LIKE ? OR s.store_name LIKE ? OR p.product_name LIKE ?)`;
        const p = `%${search}%`;
        params.push(p, p, p, p, p);
    }

    const [adminsRows] = await db.query(query, params);

    const admins = [];
    for (const row of adminsRows) {
        const admin = {
            id: row.user_id,
            name: row.admin_name,
            email: row.email,
            user_code: row.user_code,
            stores: []
        };

        const [stores] = await db.query(`SELECT store_id, store_name, image_url, brand_tier FROM store WHERE user_id = ?`, [admin.id]);

        for (const store of stores) {
            const [products] = await db.query(`
                SELECT product_id, product_name, image_url
                FROM product
                WHERE store_id = ?
            `, [store.store_id]);
            
            admin.stores.push({
                id: store.store_id,
                name: store.store_name,
                image: store.image_url,
                tier: store.brand_tier,
                products: products
            });
        }
        admins.push(admin);
    }

    return admins;
};

export const approveStoreAdmin = async (requestId) => {
    const request = await getStoreRequestById(requestId);
    if (!request) throw new Error("Request not found");

    // 1. Get user to retrieve their user_code to use as invite_code
    const user = await getUserById(request.user_id);
    const inviteCode = user.user_code;

    // 2. Update request status and set invite_code
    const updateQuery = `UPDATE store_admin_register SET status = 'approved', invite_code = ? WHERE store_register_id = ?`;
    await db.execute(updateQuery, [inviteCode, requestId]);

    // 3. Approve the pending store_mall assignment
    // Find the store owned by this user
    const [stores] = await db.query("SELECT store_id FROM store WHERE user_id = ?", [request.user_id]);
    if (stores.length > 0) {
        const storeId = stores[0].store_id;
        // Update all pending assignments for this store to 'approved'
        await db.execute("UPDATE store_mall SET status = 'approved' WHERE store_id = ? AND status = 'pending'", [storeId]);
    }

    // 4. Send Approval Email
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ahmedmohamedhany1234567@gmail.com",
            pass: "pxtgiubnhiuoemvt",
        },
    });

    await transporter.sendMail({
        from: '"Mallify Admin" <ahmedmohamedhany1234567@gmail.com>',
        to: user.email,
        subject: "Your Mallify Store Admin Request has been Approved!",
        html: `<h3>Dear ${user.name},</h3>
               <p>Congratulations! Your request to become a Store Admin for <b>${user.name}</b> has been approved.</p>
               <p>Your Admin ID / Invite Code is: <b style="color: #0ea5e9; font-family: monospace; font-size: 1.2em; letter-spacing: 2px;">${inviteCode}</b><br>
               Use your email and password to log in to the Mallify Web Dashboard.</p>
               <p>Kind regards,<br>The Mallify Team</p>`,
    });
    
    return true;
};

export const rejectStoreAdmin = async (requestId) => {
    const request = await getStoreRequestById(requestId);
    if (!request) throw new Error("Request not found");

    const user = await getUserById(request.user_id);

    // 1. Send Rejection Email
    if (user) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "ahmedmohamedhany1234567@gmail.com",
                pass: "pxtgiubnhiuoemvt",
            },
        });

        await transporter.sendMail({
            from: '"Mallify Admin" <ahmedmohamedhany1234567@gmail.com>',
            to: user.email,
            subject: "Mallify Store Admin Request - Update",
            html: `<h3>Dear ${user.name},</h3>
                   <p>Thank you for your application to Mallify.</p>
                   <p>Unfortunately, your request for Store Admin access has not been approved at this time.</p>
                   <p>If you have any questions, please contact the mall administration.</p>
                   <p>Kind regards,<br>The Mallify Team</p>`,
        });

        // 2. Cleanup: Delete User, Store, Mall Assignment and store request
        const [stores] = await db.query("SELECT store_id FROM store WHERE user_id = ?", [request.user_id]);
        if (stores.length > 0) {
            const storeId = stores[0].store_id;
            await db.execute("DELETE FROM store_mall WHERE store_id = ?", [storeId]);
            await db.execute("DELETE FROM store WHERE store_id = ?", [storeId]);
        }

        await deleteUser(user.id);
        await deleteStoreRequest(requestId);
    }

    return true;
};

export const approveMallAdmin = async (requestId) => {
    const request = await getMallRequestById(requestId);
    if (!request) throw new Error("Request not found");

    // 1. Get user to retrieve their user_code
    const user = await getUserById(request.user_id);
    const inviteCode = user.user_code;

    // 3. Update request status and store the code
    const updateQuery = `UPDATE mall_admin_register SET status = 'approved', invite_code = ? WHERE mall_register_id = ?`;
    await db.execute(updateQuery, [inviteCode, requestId]);

    // Note: We no longer call createAdmin here. 
    // The Mall Admin will use a "Verify Code" screen to activate their account and role.

    // 4. Send Approval Email
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ahmedmohamedhany1234567@gmail.com",
            pass: "pxtgiubnhiuoemvt",
        },
    });

    await transporter.sendMail({
        from: '"Mallify Admin" <ahmedmohamedhany1234567@gmail.com>',
        to: user.email,
        subject: "Your Mallify Mall Admin Request has been Approved!",
        html: `<h3>Dear ${user.name},</h3>
               <p>Congratulations! Your request to become a Mall Admin for <b>${user.name}</b> has been approved.</p>
               <p>Your mall profile has been created and your account is now active.</p>
               <p>Your Admin ID / Invite Code is: <b style="color: #0ea5e9; font-family: monospace; font-size: 1.2em; letter-spacing: 2px;">${inviteCode}</b><br>
               Use your email and password to log in to the Mallify Web Dashboard.</p>
               <p>Kind regards,<br>The Mallify Team</p>`,
    });
    
    return true;
};

export const rejectMallAdmin = async (requestId) => {
    const request = await getMallRequestById(requestId);
    if (!request) throw new Error("Request not found");

    const user = await getUserById(request.user_id);

    // 1. Send Rejection Email
    if (user) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "ahmedmohamedhany1234567@gmail.com",
                pass: "pxtgiubnhiuoemvt",
            },
        });

        await transporter.sendMail({
            from: '"Mallify Admin" <ahmedmohamedhany1234567@gmail.com>',
            to: user.email,
            subject: "Mallify Mall Admin Request - Update",
            html: `<h3>Dear ${user.name},</h3>
                   <p>Thank you for your application to Mallify.</p>
                   <p>Unfortunately, your request for Mall Admin access has not been approved at this time.</p>
                   <p>If you have any questions, please contact our system support team.</p>
                   <p>Kind regards,<br>The Mallify Team</p>`,
        });

        // 2. Cleanup: Delete user and request
        await deleteUser(user.id);
    }

    return await updateMallRequestStatus(requestId, 'rejected');
};
