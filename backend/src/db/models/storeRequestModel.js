import db from '../connection.js';

const StoreRequest = (row) => {
    if (!row) return null;
    return {
        request_id: row.request_id,
        user_id: row.user_id,
        admin_name: row.admin_name,
        commercial_registration: row.commercial_registration,
        image_url: row.image_url,
        status: row.status,
        mall_id: row.mall_id,
        approved_by: row.approved_by,
        invite_code: row.invite_code,
        created_at: row.created_at,
        // Enriched user fields
        user_name: row.user_name || null,
        user_email: row.user_email || null
    };
};

// create store request
export const createStoreRequest = async (data) => {
    const { user_id, admin_name, commercial_registration, image_url, mall_id } = data;
    
    // Add mall_id column gracefully if it doesn't exist
    try {
        await db.query("ALTER TABLE store_request ADD COLUMN mall_id INT DEFAULT NULL");
    } catch(e) { /* Column likely exists */ }

    const query = `INSERT INTO store_request (user_id, admin_name, commercial_registration, image_url, mall_id, status) VALUES (?, ?, ?, ?, ?, 'pending')`;
    const [result] = await db.execute(query, [user_id, admin_name, commercial_registration, image_url, mall_id]);
    
    const [rows] = await db.query('SELECT * FROM store_request WHERE request_id = ?', [result.insertId]);
    return StoreRequest(rows[0]);
};

// get all store requests (optionally filtered by mall_id for mall admin waitlist)
export const getAllStoreRequests = async (search = null, mall_id = null) => {
    // Add columns gracefully if they don't exist
    try { await db.query("ALTER TABLE store_request ADD COLUMN invite_code VARCHAR(50) DEFAULT NULL"); } catch(e) {}
    try { await db.query("ALTER TABLE store_request ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"); } catch(e) {}

    let query = `
        SELECT sr.*, u.name as user_name, u.email as user_email
        FROM store_request sr
        LEFT JOIN users u ON sr.user_id = u.user_id
        WHERE 1=1
    `;
    const params = [];

    if (mall_id) {
        query += ' AND sr.mall_id = ?';
        params.push(mall_id);
    }
    
    if (search) {
        query += ' AND (sr.admin_name LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR sr.invite_code LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY sr.created_at DESC';

    const [rows] = await db.query(query, params);
    return rows.map(StoreRequest);
};

// get pending count
export const getPendingStoreRequestCount = async () => {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM store_request WHERE status = 'pending'");
    return rows[0].count;
};

// get store request by id
export const getStoreRequestById = async (id) => {
    const [rows] = await db.query('SELECT * FROM store_request WHERE request_id = ?', [id]);
    return StoreRequest(rows[0]);
};

// get store request by user id
export const getStoreRequestByUserId = async (user_id) => {
    const [rows] = await db.query('SELECT * FROM store_request WHERE user_id = ?', [user_id]);
    return StoreRequest(rows[0]);
};

// update store request status and invite code
export const updateStoreRequestStatus = async (id, status, approved_by, invite_code = null) => {
    let query = 'UPDATE store_request SET status = ?';
    const params = [status];
    
    if (approved_by) {
        query += ', approved_by = ?';
        params.push(approved_by);
    }
    
    if (invite_code) {
        query += ', invite_code = ?';
        params.push(invite_code);
    }
    
    query += ' WHERE request_id = ?';
    params.push(id);
    
    await db.execute(query, params);
    
    const [rows] = await db.query('SELECT * FROM store_request WHERE request_id = ?', [id]);
    return StoreRequest(rows[0]);
};

// Delete
export const deleteStoreRequest = async (id) => {
    const [result] = await db.query('DELETE FROM store_request WHERE request_id = ?', [id]);
    return result;
};
