import db from "../connection.js";

// Create a payment record
export const createPayment = async (data) => {
    const { subscription_id, payment_amount, payment_method, payment_status } = data;
    const [result] = await db.query(
        "INSERT INTO `payment` (`subscription_id`, `payment_amount`, `payment_method`, `payment_status`) VALUES (?, ?, ?, ?)",
        [subscription_id, payment_amount, payment_method, payment_status || 'pending']
    );
    return { payment_id: result.insertId, ...data };
};

// Get payments by subscription ID
export const getPaymentsBySubscriptionId = async (subscription_id) => {
    const [rows] = await db.query("SELECT * FROM `payment` WHERE `subscription_id` = ?", [subscription_id]);
    return rows;
};

// Get payments by user ID
export const getPaymentsByUserId = async (user_id) => {
    const [rows] = await db.query(`
        SELECT p.* 
        FROM payment p
        JOIN subscriptions s ON p.subscription_id = s.subscription_id
        WHERE s.user_id = ?
    `, [user_id]);
    return rows;
};

// Update payment status
export const updatePaymentStatus = async (payment_id, status) => {
    const [result] = await db.query(
        "UPDATE `payment` SET `payment_status` = ? WHERE `payment_id` = ?",
        [status, payment_id]
    );
    return result.affectedRows > 0;
};
