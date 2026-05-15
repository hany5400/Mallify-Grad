import db from '../connection.js';

const product = (row) => {
    if (!row) return null;
    return {
        id: row.product_id,
        product_name: row.product_name,
        store_id: row.store_id, //fk
        store_name: row.store_name || '---',
        owner_name: row.owner_name || '---',
        image_url: row.image_url
    };
};


// create product
export const createProduct = async (data) => {
    const { product_name, store_id, image_url } = data;
    const query = `INSERT INTO product (product_name, store_id, image_url) VALUES (?, ?, ?)`;
    const [result] = await db.execute(query, [product_name, store_id, image_url]);
    const [rows] = await db.query('SELECT * FROM product WHERE product_id = ?', [result.insertId]);
    return product(rows[0]);
};

// get all products
export const getAllProducts = async () => {
    const query = 'SELECT product.*, store.store_name, users.name as owner_name FROM product LEFT JOIN store ON product.store_id = store.store_id LEFT JOIN users ON store.user_id = users.user_id';
    const [rows] = await db.query(query);
    return rows.map(product);
};


// get count
export const getProductCount = async () => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM product');
    return rows[0].count;
};

// get product by id
export const getProductById = async (id) => {
    const query = 'SELECT product.*, store.store_name, users.name as owner_name FROM product LEFT JOIN store ON product.store_id = store.store_id LEFT JOIN users ON store.user_id = users.user_id WHERE product.product_id = ?';
    const [rows] = await db.query(query, [id]);
    return product(rows[0]);
};


// get product by filter
export const getProductsByFilter = async (search, mallAdminId = null) => {
    let query = `
        SELECT DISTINCT product.*, store.store_name, users.name as owner_name 
        FROM product 
        LEFT JOIN store ON product.store_id = store.store_id 
        LEFT JOIN users ON store.user_id = users.user_id
    `;
    
    const params = [];
    const searchParam = `%${search}%`;

    if (mallAdminId) {
        query += `
            JOIN store_mall sm ON store.store_id = sm.store_id
            JOIN mall m ON sm.mall_id = m.mall_id
            WHERE m.user_id = ? AND sm.status = 'approved' AND (
                product.product_name LIKE ? OR store.store_name LIKE ? OR users.name LIKE ?
            )
        `;
        params.push(mallAdminId, searchParam, searchParam, searchParam);
    } else {
        query += `
            WHERE product.product_name LIKE ? OR store.store_name LIKE ? OR users.name LIKE ?
        `;
        params.push(searchParam, searchParam, searchParam);
    }

    const [rows] = await db.query(query, params);
    return rows.map(product);
};


// update product
export const updateProduct = async (id, data) => {
    const fields = [];
    const values = [];

    if (data.product_name !== undefined) {
        fields.push("product_name = ?");
        values.push(data.product_name);
    }
    if (data.image_url !== undefined) {
        fields.push("image_url = ?");
        values.push(data.image_url);
    }
    if (data.store_id !== undefined) {
        fields.push("store_id = ?");
        values.push(data.store_id);
    }

    if (fields.length === 0) {
        const [rows] = await db.query('SELECT * FROM product WHERE product_id = ?', [id]);
        return product(rows[0]);
    }

    const query = `UPDATE product SET ${fields.join(", ")} WHERE product_id = ?`;
    values.push(id);



    await db.execute(query, values);
    const [rows] = await db.query('SELECT * FROM product WHERE product_id = ?', [id]);
    return product(rows[0]);
};


// delete product
export const deleteProduct = async (id) => {
    const [result] = await db.query('DELETE FROM product WHERE product_id = ?', [id]);
    return result;
};

// get product count by stores (for stats)
export const getProductCountByStores = async (storeIds) => {
    if (!storeIds || storeIds.length === 0) return 0;
    const [rows] = await db.query('SELECT COUNT(*) as count FROM product WHERE store_id IN (?)', [storeIds]);
    return rows[0].count;
};