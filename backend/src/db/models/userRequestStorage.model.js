import db from '../connection.js';

const UserRequestStorage = (row) => {
    if (!row) return null;
    return {
        request_id: row.request_id,
        product_id: row.product_id,
        store_id: row.store_id,
        product_category_id: row.product_category_id
    };
};

//create
export const createUserRequestStorage = async (data, connection = null) => {
    const { request_id, product_id, store_id, product_category_id } = data;
    const dbConn = connection || db;
    const [res] = await dbConn.execute(
        'INSERT IGNORE INTO user_request_storage (request_id, product_id, store_id, product_category_id) VALUES (?, ?, ?, ?)',
        [request_id, product_id, store_id, product_category_id]
    );
    return { request_id, product_id, store_id, product_category_id };
};

//get all
export const getAllUserRequestStorage = async () => {
    const [rows] = await db.query('SELECT * FROM user_request_storage');
    return rows.map(UserRequestStorage);
};

// get request by id
export const getStorageByRequestId = async (request_id) => {
    const [rows] = await db.query('SELECT * FROM user_request_storage WHERE request_id = ?', [request_id]);
    return rows.map(UserRequestStorage);
};

//get product by id
export const getStorageByProductId = async (product_id) => {
    const [rows] = await db.query('SELECT * FROM user_request_storage WHERE product_id = ?', [product_id]);
    return rows.map(UserRequestStorage);
};

//get store by id
export const getStorageByStoreId = async (store_id) => {
    const [rows] = await db.query('SELECT * FROM user_request_storage WHERE store_id = ?', [store_id]);
    return rows.map(UserRequestStorage);
};

// UPDATE
export const updateUserRequestStorage = async (oldData, newData) => {
    const { request_id, store_id, product_id } = oldData;
    const { new_request_id, new_store_id, new_product_id } = newData;

    const query = `
        UPDATE user_request_storage
        SET request_id = ?, store_id = ?, product_id = ?
        WHERE request_id = ? AND store_id = ? AND product_id = ?
    `;

    const [result] = await db.execute(query, [
        new_request_id ?? request_id,
        new_store_id ?? store_id,
        new_product_id ?? product_id,
        request_id,
        store_id,
        product_id
    ]);

    return result;
};

// DELETE
export const deleteUserRequestStorage = async (request_id, product_id, store_id) => {
    const [result] = await db.execute(
        'DELETE FROM user_request_storage WHERE request_id = ? AND product_id = ? AND store_id = ?',
        [request_id, product_id, store_id]
    );
    return result;
};