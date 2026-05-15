import db from '../connection.js';

// link store to mall
export const linkStoreToMall = async (data) => {
    const { store_id, mall_id, status = 'approved' } = data;
    const query = `INSERT INTO store_mall (store_id, mall_id, status) VALUES (?, ?, ?)`;
    const [result] = await db.execute(query, [store_id, mall_id, status]);
    return result;
};

//unlink store from mall
export const unlinkStoreFromMall = async (data) => {
    const { store_id, mall_id } = data;
    const query = `DELETE FROM store_mall WHERE store_id = ? AND mall_id = ?`;
    const [result] = await db.execute(query, [store_id, mall_id]);
    return result;
};

// check if store is linked to mall
export const isStoreInMall = async (data) => {
    const { store_id, mall_id } = data;
    const query = `SELECT * FROM store_mall WHERE store_id = ? AND mall_id = ? AND status = 'approved'`;
    const [rows] = await db.execute(query, [store_id, mall_id]);
    return rows.length > 0;
};

// get all stores for a mall
export const getStoreIdsByMall = async (mall_id) => {
    const query = `SELECT store_id FROM store_mall WHERE mall_id = ? AND status = 'approved'`;
    const [rows] = await db.execute(query, [mall_id]);
    return rows.map(r => r.store_id);
};

// get all malls for a store
export const getMallIdsByStore = async (store_id) => {
    const query = `SELECT mall_id FROM store_mall WHERE store_id = ? AND status = 'approved'`;
    const [rows] = await db.execute(query, [store_id]);
    return rows.map(r => r.mall_id);
};

// update store_mall link
export const updateStoreMallLink = async (data) => {
    const { old_store_id, old_mall_id, new_store_id, new_mall_id } = data;
    const query = `UPDATE store_mall SET store_id = ?, mall_id = ? WHERE store_id = ? AND mall_id = ?`;
    const [result] = await db.execute(query, [new_store_id, new_mall_id, old_store_id, old_mall_id]);
    return result;
};

export const getPendingStoreMallRequests = async (userId = null) => {
    let query = `
        SELECT sm.store_id, sm.mall_id, sm.status, s.store_name, m.mall_name, u.name as owner_name 
        FROM store_mall sm
        JOIN store s ON sm.store_id = s.store_id
        JOIN mall m ON sm.mall_id = m.mall_id
        JOIN users u ON s.user_id = u.user_id
        WHERE sm.status = 'pending'
    `;
    const params = [];

    if (userId) {
        query += ' AND m.user_id = ?';
        params.push(userId);
    }

    const [rows] = await db.execute(query, params);
    return rows;
};

export const updateStoreMallStatus = async (store_id, mall_id, status) => {
    const query = `UPDATE store_mall SET status = ? WHERE store_id = ? AND mall_id = ?`;
    const [result] = await db.execute(query, [status, store_id, mall_id]);
    return result;
};