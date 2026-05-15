import db from '../../db/connection.js';

const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
};

export const getDerivedNotifications = async (userId) => {
    // 1. Get requests for this user from last 24 hours
    const [requests] = await db.query(`
        SELECT ur.request_id, r.total_price, ur.published_at
        FROM user_request ur 
        JOIN result r ON ur.request_id = r.request_id 
        WHERE ur.user_id = ? 
          AND ur.published_at >= NOW() - INTERVAL 1 DAY
        ORDER BY ur.request_id DESC 
    `, [userId]);

    // 2. Get active discounts from last 24 hours with item counts
    const [discounts] = await db.query(`
        SELECT d.discount_id, d.title, d.amount, s.store_name, d.published_at,
               (SELECT COUNT(*) FROM discount_target WHERE discount_id = d.discount_id) as target_count,
               (SELECT pc.product_category_name 
                FROM discount_target dt 
                JOIN product_category pc ON dt.product_category_id = pc.product_category_id 
                WHERE dt.discount_id = d.discount_id LIMIT 1) as first_item,
               (SELECT p.product_name 
                FROM discount_target dt 
                JOIN product p ON dt.product_id = p.product_id 
                WHERE dt.discount_id = d.discount_id LIMIT 1) as first_prod
        FROM discount d 
        JOIN store s ON d.store_id = s.store_id 
        WHERE d.expiry_date > CURDATE()
          AND d.published_at >= NOW() - INTERVAL 1 DAY
        ORDER BY d.published_at DESC 
    `);

    // 3. Get stores and malls from last 24 hours
    const [stores] = await db.query(`
        SELECT store_id, store_name as name, entry_date 
        FROM store 
        WHERE entry_date >= NOW() - INTERVAL 1 DAY
        ORDER BY store_id DESC
    `);
    
    const [malls] = await db.query(`
        SELECT mall_id, mall_name as name, entry_date 
        FROM mall 
        WHERE entry_date >= NOW() - INTERVAL 1 DAY
        ORDER BY mall_id DESC
    `);

    const notifications = [];

    // Map requests to notifications
    requests.forEach(req => {
        notifications.push({
            id: `req_${req.request_id}`,
            title: 'Request Successful!',
            subtitle: `Your request #${req.request_id} for ${req.total_price} EGP has been processed.`,
            time: getTimeAgo(req.published_at),
            icon: 'check_circle_outline',
            color: 'green',
            type: 'Requests',
            isRead: false
        });
    });

    // Map discounts to notifications
    discounts.forEach(disc => {
        let itemInfo = disc.first_item || disc.first_prod || "various items";
        if (disc.target_count > 1) {
            itemInfo += ` and ${disc.target_count - 1} more items`;
        } else if (disc.target_count === 0) {
            itemInfo = "all products";
        }

        notifications.push({
            id: `disc_${disc.discount_id}`,
            title: disc.title || 'New Promotion',
            subtitle: `${disc.store_name} added a ${disc.amount}% discount on ${itemInfo}.`,
            time: getTimeAgo(disc.published_at),
            icon: 'local_offer_outlined',
            color: 'orange',
            type: 'Promotions',
            isRead: false
        });
    });

    // Map stores to notifications
    stores.forEach(s => {
        notifications.push({
            id: `store_${s.store_id}`,
            title: 'New Store Open!',
            subtitle: `${s.name} is now available on Mallify.`,
            time: getTimeAgo(s.entry_date),
            icon: 'storefront_outlined',
            color: 'purple',
            type: 'Updates',
            isRead: false
        });
    });

    // Map malls to notifications
    malls.forEach(m => {
        notifications.push({
            id: `mall_${m.mall_id}`,
            title: 'New Mall Added!',
            subtitle: `${m.name} has joined the Mallify network.`,
            time: getTimeAgo(m.entry_date),
            icon: 'business_outlined',
            color: 'blue',
            type: 'Updates',
            isRead: false
        });
    });

    return notifications;
};
