import db from '../connection.js';

// Create a mall admin registration request
export const createMallAdminRegister = async (data) => {
    const { user_id, commercial_license = null, identification_document = null, invite_code = null, status = 'pending' } = data;
    
    const query = `INSERT INTO mall_admin_register (user_id, commercial_license, identification_document, invite_code, status) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(query, [user_id, commercial_license, identification_document, invite_code, status]);
    return { id: result.insertId, ...data };
};

// Get mall registration requests for the dashboard (Pending + recently Approved/Rejected)
export const getPendingMallRequests = async () => {
    const query = `
        SELECT mar.*, u.name as user_name, u.email as user_email 
        FROM mall_admin_register mar
        JOIN users u ON mar.user_id = u.user_id
        WHERE mar.status = 'pending' 
        OR (mar.status IN ('approved', 'rejected') AND mar.created_at >= DATE_SUB(NOW(), INTERVAL 12 HOUR))
        ORDER BY mar.status = 'pending' DESC, mar.created_at DESC
    `;
    const [rows] = await db.query(query);
    return rows;
};

// Update mall registration status
export const updateMallRequestStatus = async (register_id, status) => {
    const query = `UPDATE mall_admin_register SET status = ? WHERE mall_register_id = ?`;
    const [result] = await db.execute(query, [status, register_id]);
    return result.affectedRows > 0;
};

// Get mall request by id
export const getMallRequestById = async (id) => {
    const [rows] = await db.query("SELECT * FROM mall_admin_register WHERE mall_register_id = ?", [id]);
    return rows[0];
};

export const getMallRequestByUserId = async (userId) => {
    const [rows] = await db.query("SELECT * FROM mall_admin_register WHERE user_id = ?", [userId]);
    return rows[0];
};

export const getPendingMallRequestCount = async () => {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM mall_admin_register WHERE status = 'pending'");
    return rows[0].count;
};
