import db from '../connection.js';

const productCategory = (row) => {
    if (!row) return null;
    return {
        id: row.product_category_id,
        product_category_name: row.product_category_name,
        size: row.size,
        price: row.price,
        product_id: row.product_id, // fk
        product_name: row.product_name || '---',
        image_url: row.image_url
    };
};

// create product category
export const createProductCategory = async (data) => {
    const { product_category_name, size, price, product_id, color, image_url } = data;
    const query = `INSERT INTO product_category (product_category_name, size, price, product_id, image_url) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(query, [product_category_name, size, price, product_id, image_url]);
    const [rows] = await db.query('SELECT * FROM product_category WHERE product_category_id = ?', [result.insertId]);
    return productCategory(rows[0]);
};

// get all product categories
export const getAllProductCategories = async () => {
    const query = 'SELECT product_category.*, product.product_name FROM product_category LEFT JOIN product ON product_category.product_id = product.product_id';
    const [rows] = await db.query(query);
    return rows.map(productCategory);
};

// get product category by ID
export const getProductCategoryById = async (id) => {
    const query = 'SELECT product_category.*, product.product_name FROM product_category LEFT JOIN product ON product_category.product_id = product.product_id WHERE product_category.product_category_id = ?';
    const [rows] = await db.query(query, [id]);
    return productCategory(rows[0]);
};

//get product by filter
export const getProductCategoryByFilter = async (search) => {
    const query = `
        SELECT product_category.*, product.product_name 
        FROM product_category 
        LEFT JOIN product ON product_category.product_id = product.product_id 
        WHERE product_category.product_category_name LIKE ? OR product.product_name LIKE ? OR product_category.size LIKE ?
    `;

    const searchParam = `%${search}%`;
    const [rows] = await db.query(query, [searchParam, searchParam, searchParam]);
    return rows.map(productCategory);
};

// update product category
export const updateProductCategory = async (id, data) => {
    const fields = [];
    const values = [];

    if (data.product_category_name !== undefined) {
        fields.push("product_category_name = ?");
        values.push(data.product_category_name);
    }
    if (data.size !== undefined) {
        fields.push("size = ?");
        values.push(data.size);
    }
    if (data.price !== undefined) {
        fields.push("price = ?");
        values.push(data.price);
    }
    if (data.image_url !== undefined) {
        fields.push("image_url = ?");
        values.push(data.image_url);
    }
    if (data.product_id !== undefined) {
        fields.push("product_id = ?");
        values.push(data.product_id);
    }

    if (fields.length === 0) {
        const [rows] = await db.query('SELECT * FROM product_category WHERE product_category_id = ?', [id]);
        return productCategory(rows[0]);
    }

    const query = `UPDATE product_category SET ${fields.join(", ")} WHERE product_category_id = ?`;
    values.push(id);

    await db.execute(query, values);
    const [rows] = await db.query('SELECT * FROM product_category WHERE product_category_id = ?', [id]);
    return productCategory(rows[0]);
};


// delete product category
export const deleteProductCategory = async (id) => {
    const [result] = await db.query('DELETE FROM product_category WHERE product_category_id = ?', [id]);
    return result;
};

// get category count by stores (for stats)
export const getProductCategoryCountByStores = async (storeIds) => {
    if (!storeIds || storeIds.length === 0) return 0;
    const query = `
        SELECT COUNT(*) as count 
        FROM product_category pc 
        JOIN product p ON pc.product_id = p.product_id 
        WHERE p.store_id IN (?)
    `;
    const [rows] = await db.query(query, [storeIds]);
    return rows[0].count;
};
