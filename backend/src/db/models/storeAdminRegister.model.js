import db from '../connection.js';

// Create a store admin registration request
export const createStoreAdminRegister = async (data) => {
    const { 
        user_id, 
        commercial_license = null, 
        identification_document = null, 
        invite_code = null, 
        status = 'pending' 
    } = data;
    
    const query = `INSERT INTO store_admin_register (user_id, commercial_license, identification_document, invite_code, status) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(query, [user_id, commercial_license, identification_document, invite_code, status]);
    return { id: result.insertId, ...data };
};

// Get store registration requests for the dashboard (Pending + recently Approved/Rejected)
export const getPendingStoreRequests = async (mallId = null) => {
    let query = `
        SELECT sar.*, u.name as user_name, u.email as user_email, m.mall_name, m.mall_id
        FROM store_admin_register sar
        JOIN users u ON sar.user_id = u.user_id
        LEFT JOIN store s ON u.user_id = s.user_id
        LEFT JOIN store_mall sm ON s.store_id = sm.store_id
        LEFT JOIN mall m ON sm.mall_id = m.mall_id
        WHERE (sar.status = 'pending'
        OR (sar.status IN ('approved', 'rejected') AND sar.created_at >= DATE_SUB(NOW(), INTERVAL 12 HOUR)))
    `;
    const params = [];

    if (mallId) {
        if (Array.isArray(mallId)) {
            query += ` AND sm.mall_id IN (?)`;
            params.push(mallId);
        } else {
            query += ` AND sm.mall_id = ?`;
            params.push(mallId);
        }
    }

    query += ` ORDER BY sar.status = 'pending' DESC, sar.created_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
};

// Update store registration status
export const updateStoreRequestStatus = async (register_id, status) => {
    const query = `UPDATE store_admin_register SET status = ? WHERE store_register_id = ?`;
    const [result] = await db.execute(query, [status, register_id]);
    return result.affectedRows > 0;
};

// Get store request by id
export const getStoreRequestById = async (id) => {
    const [rows] = await db.query("SELECT * FROM store_admin_register WHERE store_register_id = ?", [id]);
    return rows[0];
};

export const getStoreRequestByUserId = async (userId) => {
    const [rows] = await db.query("SELECT * FROM store_admin_register WHERE user_id = ?", [userId]);
    return rows[0];
};

export const getPendingStoreRequestCount = async () => {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM store_admin_register WHERE status = 'pending'");
    return rows[0].count;
};

// Alias for search functionality if needed, or just reuse getPendingStoreRequests
export const getAllStoreRequests = async (search = '', mallId = null) => {
    return await getPendingStoreRequests(mallId);
};

export const deleteStoreRequest = async (id) => {
    const query = `DELETE FROM store_admin_register WHERE store_register_id = ?`;
    await db.execute(query, [id]);
};
