import {
    createUserRequest as createUserRequestModel,
    getAllUserRequests as getAllUserRequestsModel,
    getUserRequestById as getUserRequestByIdModel,
    updateUserRequest as updateUserRequestModel,
    deleteUserRequest as deleteUserRequestModel,
    getUserRequestsByUserId as getUserRequestsByUserIdModel,
    getUserRequestByFilter as getUserRequestByFilterModel
} from '../../db/models/userRequest.model.js';
import db from '../../db/connection.js';

// create
export const createUserRequest = async (data, user) => {
    if (!user || !user.id) throw new Error("User is required");

    const { budget } = data;
    if (!budget || budget <= 0) {
        throw new Error("Valid budget is required");
    }

    return await createUserRequestModel({
        user_id: user.id,
        budget
    });
};

// get all
export const getAllUserRequests = async () => {
    return await getAllUserRequestsModel();
};

// get one
export const getUserRequestById = async (id) => {
    const request = await getUserRequestByIdModel(id);
    if (!request) throw new Error("Request not found");

    return request;
};

// get user requests (user)
export const getUserRequestsByUserId = async (userId) => {
    return await getUserRequestsByUserIdModel(userId);
};

// get user request by filter
export const getUserRequestByFilter = async (keyword, keyvalue) => {
    return await getUserRequestByFilterModel(keyword, keyvalue);
};

// get user requests by filter (for logged-in user)
export const getUserRequestsByFilterForUser = async (user, keyword, keyvalue) => {
    if (!user || !user.id) throw new Error("User is required");

    const allowedFields = ['budget', 'request_id', 'user_id'];
    if (!allowedFields.includes(keyword)) {
        throw new Error("Invalid filter field");
    }
    const requests = await getUserRequestByFilterModel(keyword, keyvalue);

    return requests.filter(r => r.user_id === user.id);
};

// update
export const updateUserRequest = async (id, data, user) => {
    if (!user || !user.id) throw new Error("User is required");
    const request = await getUserRequestByIdModel(id);
    if (!request) throw new Error("Request not found");
    if (request.user_id !== user.id) throw new Error("Unauthorized");
    const { budget } = data;
    if (!budget || budget <= 0) {
        throw new Error("Valid budget is required");
    }
    return await updateUserRequestModel(id, { budget });
};

// delete
export const deleteUserRequest = async (id, user) => {
    if (!user || !user.id) throw new Error("User is required");

    const request = await getUserRequestByIdModel(id);
    if (!request) throw new Error("Request not found");

    if (request.user_id !== user.id) {
        throw new Error("Unauthorized");
    }

    return await deleteUserRequestModel(id);
};

// Find matches based on filters
export const findMatches = async (filters) => {
    const { mall_id, search, size, brand_tier, budget } = filters;
    const { default: db } = await import('../../db/connection.js');
    
    let sql = `
        SELECT 
            pc.product_category_id, 
            pc.product_category_name, 
            pc.size, 
            pc.price, 
            pc.image_url as category_image,
            p.product_id,
            s.store_id,
            p.product_name, 
            s.store_name, 
            s.brand_tier,
            s.store_location,
            m.mall_name,
            (
                SELECT MAX(d.amount)
                FROM discount d
                LEFT JOIN discount_target dt ON d.discount_id = dt.discount_id
                WHERE d.store_id = s.store_id 
                  AND d.expiry_date > CURDATE()
                  AND (
                      dt.product_category_id = pc.product_category_id 
                      OR (dt.product_category_id IS NULL AND dt.product_id = p.product_id)
                      OR (dt.product_category_id IS NULL AND dt.product_id IS NULL)
                  )
            ) as discount_percentage
        FROM product_category pc
        JOIN product p ON pc.product_id = p.product_id
        JOIN store s ON p.store_id = s.store_id
        JOIN store_mall sm ON s.store_id = sm.store_id
        JOIN mall m ON sm.mall_id = m.mall_id
        WHERE 1=1
    `;
    
    const params = [];

    if (mall_id && mall_id !== '') {
        sql += " AND m.mall_id = ?";
        params.push(Number(mall_id));
    }

    // Budget will be applied at the end in a HAVING clause so it accounts for discounts
    let budgetValue = null;
    if (budget) {
        budgetValue = Number(budget);
    }

    if (search && search.trim() !== '') {
        const tokens = search.trim().toLowerCase().split(/\s+/);
        tokens.forEach(token => {
            sql += ` AND (
                LOWER(p.product_name) LIKE ? 
                OR LOWER(pc.product_category_name) LIKE ? 
                OR LOWER(s.store_name) LIKE ?
                OR LOWER(s.brand_tier) LIKE ?
            )`;
            const pattern = `%${token}%`;
            params.push(pattern, pattern, pattern, pattern);
        });
    }

    if (size && size !== 'any' && size.toString().trim() !== '') {
        sql += " AND LOWER(pc.size) = LOWER(?)";
        params.push(size.trim());
    }

    if (brand_tier && brand_tier !== 'any') {
        sql += " AND LOWER(s.brand_tier) = LOWER(?)";
        params.push(brand_tier.trim());
    }

    if (budgetValue !== null) {
        sql += " HAVING (pc.price * (1 - IFNULL(discount_percentage, 0) / 100)) <= ?";
        params.push(budgetValue);
    }

    sql += " ORDER BY (pc.price * (1 - IFNULL(discount_percentage, 0) / 100)) ASC LIMIT 50";

    const [rows] = await db.query(sql, params);
    return rows;
};

// Handle final submission (Request + Results + Points)
export const finalSubmit = async (data, user) => {
    if (!user || !user.id) throw new Error("User is required");
    
    const { budget, items, points_earned } = data;
    const { default: db } = await import('../../db/connection.js');
    const { createUserRequest } = await import('../../db/models/userRequest.model.js');
    const { createUserRequestStorage } = await import('../../db/models/userRequestStorage.model.js');
    const { createResult } = await import('../../db/models/result.model.js');
    
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        
        // 1. Create User Request (Using Model)
        const userReq = await createUserRequest({ user_id: user.id, budget }, conn);
        const requestId = userReq.request_id;
        
        // 2. Save Results (Selected Alternatives)
        let totalSpent = 0;
        for (const item of items) {
            const productId = item.product_id;
            const storeId = item.store_id;
            const price = parseFloat(item.price) || 0;
            totalSpent += price;
            
            if (productId && storeId) {
                // Using Model for storage
                await createUserRequestStorage({ 
                    request_id: requestId, 
                    product_id: productId, 
                    store_id: storeId,
                    product_category_id: item.product_category_id // Save the specific variant selected
                }, conn);
            }
        }
        
        // 3. Save to result table (Using Model)
        await createResult({ 
            request_id: requestId, 
            total_price: totalSpent 
        }, conn);
        
        // 4. Update User Points
        if (points_earned > 0) {
            await conn.execute(
                "UPDATE users SET points = points + ? WHERE user_id = ?",
                [points_earned, user.id]
            );
        }
        
        await conn.commit();
        return { requestId, success: true };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

// Get User History
export const getUserHistory = async (userId, limit = 3) => {
    const { default: db } = await import('../../db/connection.js');
    
    // 1. Get requests (use LEFT JOIN to show requests even without results yet)
    let query = `
        SELECT 
            ur.request_id,
            ur.budget,
            COALESCE(res.total_price, 0) as total_price,
            ur.published_at
        FROM user_request ur
        LEFT JOIN result res ON ur.request_id = res.request_id
        WHERE ur.user_id = ?
        ORDER BY ur.request_id DESC
    `;
    
    const params = [userId];
    if (limit !== null) {
        query += ` LIMIT ?`;
        params.push(limit);
    }
    
    const [requests] = await db.query(query, params);
    
    // 2. For each request, get the items
    const history = [];
    for (const req of requests) {
        const itemQuery = `
            SELECT 
                p.product_name,
                p.image_url as product_image,
                pc.product_category_name as description,
                pc.size,
                pc.price * (1 - IFNULL((
                    SELECT MAX(d.amount)
                    FROM discount d
                    LEFT JOIN discount_target dt ON d.discount_id = dt.discount_id
                    WHERE d.store_id = s.store_id 
                      AND d.expiry_date > CURDATE()
                      AND (
                          dt.product_category_id = pc.product_category_id 
                          OR (dt.product_category_id IS NULL AND dt.product_id = p.product_id)
                          OR (dt.product_category_id IS NULL AND dt.product_id IS NULL)
                      )
                ), 0) / 100) as price,
                pc.image_url as category_image,
                s.store_name,
                'Black' as color
            FROM user_request_storage urs
            JOIN product p ON urs.product_id = p.product_id
            JOIN product_category pc ON urs.product_category_id = pc.product_category_id
            LEFT JOIN store s ON urs.store_id = s.store_id
            WHERE urs.request_id = ?
        `;
        const [items] = await db.query(itemQuery, [req.request_id]);
        history.push({
            ...req,
            items
        });
    }
    
    return history;
};

// Check subscription and log search usage
export const checkAndLogSearch = async (user) => {
    if (!user || !user.id) throw new Error("User is required");

    // 1. Get user's subscription
    const [subs] = await db.query(`
        SELECT plan_type, search_count, end_date, status FROM subscriptions 
        WHERE user_id = ?
    `, [user.id]);

    if (subs.length === 0) throw new Error("No active subscription found");
    const sub = subs[0];

    // Check if premium plan has expired
    if (sub.plan_type === 'premium' && sub.end_date) {
        const endDate = new Date(sub.end_date);
        const now = new Date();
        if (now > endDate) {
            // Plan expired, revert to free and set status to 'expired'
            await db.query("UPDATE subscriptions SET plan_type = 'free', status = 'expired', end_date = NULL WHERE user_id = ?", [user.id]);
            sub.plan_type = 'free';
            sub.end_date = null;
            sub.status = 'expired';
        }
    }

    // 2. If premium or system_admin, ignore limit
    if (sub.plan_type === 'premium' || user.role === 'system_admin') return { ok: true, plan: sub.plan_type || 'premium' };

    // 3. For free users, check count and status
    if (sub.search_count >= 5 || sub.status === 'expired') {
        throw new Error("LIMIT_REACHED");
    }

    // 4. Increment the counter and check for expiry
    const newCount = sub.search_count + 1;
    const newStatus = newCount >= 5 ? 'expired' : 'active';

    await db.query("UPDATE subscriptions SET search_count = ?, status = ? WHERE user_id = ?", [newCount, newStatus, user.id]);

    return { ok: true, plan: 'free', used: newCount };
}