import db from "../connection.js";

// Create a subscription
export const createSubscription = async (data) => {
    const { user_id, plan_type, status, start_date, end_date } = data;
    const [result] = await db.query(
        "INSERT INTO `subscriptions` (`user_id`, `plan_type`, `status`, `start_date`, `end_date`) VALUES (?, ?, ?, ?, ?)",
        [user_id, plan_type || 'free', status || 'active', start_date || null, end_date || null]
    );
    return { id: result.insertId, ...data };
};

// Get subscription by user ID
export const getSubscriptionByUserId = async (user_id) => {
    const [rows] = await db.query("SELECT * FROM `subscriptions` WHERE `user_id` = ?", [user_id]);
    return rows[0];
};

// Update subscription
export const updateSubscription = async (user_id, updateData) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(updateData)) {
        fields.push(`\`${key}\` = ?`);
        values.push(value);
    }
    values.push(user_id);
    
    const [result] = await db.query(
        `UPDATE \`subscriptions\` SET ${fields.join(", ")} WHERE \`user_id\` = ?`,
        values
    );
    return result.affectedRows > 0;
};
