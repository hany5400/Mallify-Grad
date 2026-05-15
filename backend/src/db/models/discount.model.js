import db from '../connection.js';

const discount = (row) => {
    if (!row) return null;
    return {
        id: row.discount_id,
        title: row.title,
        amount: row.amount,
        expiry_date: row.expiry_date,
        store_id: row.store_id,
        status: row.status
    };
};

const discountTarget = (row) => {
    if (!row) return null;
    return {
        id: row.discount_target_id,
        discount_id: row.discount_id,
        product_id: row.product_id,
        product_category_id: row.product_category_id
    };
};

// Create discount
export const createDiscount = async (data) => {
    const { title, amount, store_id, expiry_date, targets } = data;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            'INSERT INTO discount (title, amount, store_id, expiry_date) VALUES (?, ?, ?, ?)',
            [title, amount, store_id, expiry_date]
        );
        const discountId = result.insertId;

        if (targets && targets.length > 0) {
            for (const target of targets) {
                await connection.execute(
                    'INSERT INTO discount_target (discount_id, product_id, product_category_id) VALUES (?, ?, ?)',
                    [discountId, target.product_id || null, target.product_category_id || null]
                );
            }
        }

        await connection.commit();
        const [rows] = await db.query('SELECT * FROM discount WHERE discount_id = ?', [discountId]);
        return discount(rows[0]);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Get all discounts with targets
export const getAllDiscounts = async () => {
    const [rows] = await db.query(`
        SELECT d.*, 
               dt.discount_target_id, dt.product_id, dt.product_category_id,
               p.product_name, pc.product_category_name, pc.size as category_size,
               s.store_name, s.brand_tier as store_brand_tier, s.image_url as store_image, m.mall_name, m.mall_id
        FROM discount d
        LEFT JOIN discount_target dt ON d.discount_id = dt.discount_id
        LEFT JOIN product p ON dt.product_id = p.product_id
        LEFT JOIN product_category pc ON dt.product_category_id = pc.product_category_id
        LEFT JOIN store s ON d.store_id = s.store_id
        LEFT JOIN store_mall sm ON s.store_id = sm.store_id
        LEFT JOIN mall m ON sm.mall_id = m.mall_id
        WHERE d.expiry_date > CURDATE()
    `);
    
    // Group targets by discount
    const discountsMap = {};
    rows.forEach(row => {
        if (!discountsMap[row.discount_id]) {
            discountsMap[row.discount_id] = {
                ...row,
                id: row.discount_id,
                store_name: row.store_name,
                mall_name: row.mall_name,
                store_image: row.store_image,
                targets: []
            };
        }
        if (row.discount_target_id) {
            discountsMap[row.discount_id].targets.push({
                id: row.discount_target_id,
                product_id: row.product_id,
                product_category_id: row.product_category_id,
                product_name: row.product_name,
                category_name: row.product_category_name ? `${row.product_category_name} (${row.category_size})` : 'All Types/Sizes',
                category_size: row.category_size
            });
        }
    });
    
    return Object.values(discountsMap);
};

// Get discount by id
export const getDiscountById = async (id) => {
    const [rows] = await db.query(`
        SELECT d.*, 
               dt.discount_target_id, dt.product_id, dt.product_category_id,
               p.product_name, pc.product_category_name, pc.size as category_size
        FROM discount d
        LEFT JOIN discount_target dt ON d.discount_id = dt.discount_id
        LEFT JOIN product p ON dt.product_id = p.product_id
        LEFT JOIN product_category pc ON dt.product_category_id = pc.product_category_id
        WHERE d.discount_id = ?
    `, [id]);
    
    if (rows.length === 0) return null;
    
    const d = discount(rows[0]);
    d.targets = rows.filter(r => r.discount_target_id).map(r => ({
        id: r.discount_target_id,
        product_id: r.product_id,
        product_category_id: r.product_category_id,
        product_name: r.product_name,
        category_name: r.product_category_name ? `${r.product_category_name} (${r.category_size})` : 'All Types/Sizes'
    }));
    
    return d;
};

// Update discount
export const updateDiscount = async (id, data) => {
    const { title, amount, expiry_date, targets } = data;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute(
            'UPDATE discount SET title = ?, amount = ?, expiry_date = ? WHERE discount_id = ?',
            [title, amount, expiry_date, id]
        );

        if (targets) {
            // Re-sync targets
            await connection.execute('DELETE FROM discount_target WHERE discount_id = ?', [id]);
            for (const target of targets) {
                await connection.execute(
                    'INSERT INTO discount_target (discount_id, product_id, product_category_id) VALUES (?, ?, ?)',
                    [id, target.product_id || null, target.product_category_id || null]
                );
            }
        }

        await connection.commit();
        return await getDiscountById(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Delete discount
export const deleteDiscount = async (id) => {
    const [result] = await db.query('DELETE FROM discount WHERE discount_id = ?', [id]);
    return result;
};

// Get active discount count by stores
export const getActiveDiscountCountByStores = async (storeIds) => {
    if (!storeIds || storeIds.length === 0) return 0;
    const [rows] = await db.query('SELECT COUNT(*) as count FROM discount WHERE store_id IN (?) AND expiry_date > CURDATE()', [storeIds]);
    return rows[0].count;
};