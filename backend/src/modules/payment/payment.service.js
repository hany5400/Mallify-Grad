import { createPayment, getPaymentsByUserId, updatePaymentStatus } from "../../db/models/payment.model.js";
import { getSubscriptionByUserId, updateSubscription } from "../../db/models/subscriptions.model.js";

// Process a new premium subscription payment
export const processSubscriptionPayment = async (user, paymentData) => {
    if (!user || !user.id) throw new Error("User is required");

    const { amount, method, duration_months = 1 } = paymentData;
    
    // 1. Get current subscription
    const subscription = await getSubscriptionByUserId(user.id);
    if (!subscription) throw new Error("Subscription record not found for user");

    // 2. Create payment record (simulating a successful payment for now)
    const payment = await createPayment({
        subscription_id: subscription.subscription_id,
        payment_amount: amount,
        payment_method: method,
        payment_status: 'completed'
    });

    // 3. Upgrade subscription to premium
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    // Add whole months first
    const wholeMonths = Math.floor(duration_months);
    endDate.setMonth(startDate.getMonth() + wholeMonths);
    
    // Add fractional part as days (assuming 30-day average month for fractions)
    const fractionalPart = duration_months - wholeMonths;
    if (fractionalPart > 0) {
        const extraDays = Math.round(fractionalPart * 30);
        endDate.setDate(endDate.getDate() + extraDays);
    }

    await updateSubscription(user.id, {
        plan_type: 'premium',
        status: 'active',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
    });

    return {
        success: true,
        message: "Payment successful. You are now a Premium member!",
        payment_id: payment.payment_id
    };
};

// Get payment history for user
export const getUserPaymentHistory = async (userId) => {
    return await getPaymentsByUserId(userId);
};
