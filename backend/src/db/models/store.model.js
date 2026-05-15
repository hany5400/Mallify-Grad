import db from '../connection.js';

const store = (row) => {
    if (!row) return null;
    return {
        id: row.store_id,
        store_location: row.store_location,
        store_name: row.store_name,
        brand_tier: row.brand_tier,
        user_id: row.user_id, //fk users table
        owner_name: row.owner_name || 'N/A',
        owner_email: row.owner_email || null,
        image_url: row.image_url,
        mall_name: row.mall_name || null
    };
};

// create store
export const createStore = async (data) => {
    const location = data.location || data.store_location || null;
    const store_name = data.store_name || null;
    const brand_tier = data.brand_tier || 'Bronze';
    const user_id = data.user_id || null;
    const image_url = data.image_url || null;
    


    const query = `INSERT INTO store (store_location, store_name, brand_tier, user_id, image_url) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(query, [location, store_name, brand_tier, user_id, image_url]);
    const [rows] = await db.query('SELECT * FROM store WHERE store_id = ?', [result.insertId]);
    return store(rows[0]);
};

// get all stores
export const getAllStores = async () => {
    const query = `
        SELECT store.*, users.name as owner_name, users.email as owner_email, mall.mall_name 
        FROM store 
        LEFT JOIN users ON store.user_id = users.user_id
        LEFT JOIN store_mall ON store.store_id = store_mall.store_id AND store_mall.status = 'approved'
        LEFT JOIN mall ON store_mall.mall_id = mall.mall_id
    `;
    const [rows] = await db.query(query);
    return rows.map(store);
};

// get count
export const getStoreCount = async () => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM store');
    return rows[0].count;
};

// get store by id
export const getStoreById = async (id) => {
    const query = 'SELECT store.*, users.name as owner_name, users.email as owner_email FROM store LEFT JOIN users ON store.user_id = users.user_id WHERE store.store_id = ?';
    const [rows] = await db.query(query, [id]);
    return store(rows[0]);
};

// get store by filter
export const getStoresByFilter = async (search, mallAdminId = null) => {
    let query = `
        SELECT DISTINCT store.*, users.name as owner_name, users.email as owner_email 
        FROM store 
        LEFT JOIN users ON store.user_id = users.user_id 
    `;
    
    const params = [];
    const searchParam = `%${search}%`;
    
    if (mallAdminId) {
        query += `
            JOIN store_mall sm ON store.store_id = sm.store_id
            JOIN mall m ON sm.mall_id = m.mall_id
            WHERE m.user_id = ? AND sm.status = 'approved' AND (
                store.store_name LIKE ? OR users.name LIKE ? OR store.brand_tier LIKE ? OR store.store_location LIKE ?
            )
        `;
        params.push(mallAdminId, searchParam, searchParam, searchParam, searchParam);
    } else {
        query += `
            WHERE store.store_name LIKE ? OR users.name LIKE ? OR store.brand_tier LIKE ? OR store.store_location LIKE ?
        `;
        params.push(searchParam, searchParam, searchParam, searchParam);
    }

    const [rows] = await db.query(query, params);
    return rows.map(store);
};

// update store
export const updateStore = async (id, data) => {
    const fields = [];
    const values = [];

    if (data.location !== undefined || data.store_location !== undefined) {
        fields.push("store_location = ?");
        values.push(data.location || data.store_location);
    }
    if (data.store_name !== undefined) {
        fields.push("store_name = ?");
        values.push(data.store_name);
    }
    if (data.brand_tier !== undefined) {
        fields.push("brand_tier = ?");
        values.push(data.brand_tier);
    }
    if (data.image_url !== undefined) {
        fields.push("image_url = ?");
        values.push(data.image_url);
    }

    if (fields.length === 0) {
        const [rows] = await db.query('SELECT * FROM store WHERE store_id = ?', [id]);
        return store(rows[0]);
    }

    const query = `UPDATE store SET ${fields.join(", ")} WHERE store_id = ?`;
    values.push(id);



    await db.execute(query, values);
    const [rows] = await db.query('SELECT * FROM store WHERE store_id = ?', [id]);
    return store(rows[0]);
};


// delete store
export const deleteStore = async (id) => {
    const [result] = await db.query('DELETE FROM store WHERE store_id = ?', [id]);
    return result;
};

// get all store IDs for an admin
export const getStoreIdsByAdmin = async (userId) => {
    const [rows] = await db.query('SELECT store_id FROM store WHERE user_id = ?', [userId]);
    return rows.map(r => r.store_id);
};

// get stores assigned to malls owned by a specific mall admin
export const getStoresByMallAdmin = async (userId) => {
    const query = `
        SELECT DISTINCT s.*, u.name as owner_name, u.email as owner_email 
        FROM store s
        JOIN store_mall sm ON s.store_id = sm.store_id
        JOIN mall m ON sm.mall_id = m.mall_id
        LEFT JOIN users u ON s.user_id = u.user_id
        WHERE m.user_id = ? AND sm.status = 'approved'
    `;
    const [rows] = await db.query(query, [userId]);
    return rows.map(store);
};