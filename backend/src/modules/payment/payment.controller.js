import express from 'express';
import { authenticateUser } from '../users/middleWaresUsers/authenticateUser.js';
import { processSubscriptionPayment, getUserPaymentHistory } from './payment.service.js';

const router = express.Router();

// Process a payment (Simulated)
router.post('/process', authenticateUser, async (req, res) => {
    try {
        const result = await processSubscriptionPayment(req.user, req.body);
        res.json({ ok: true, ...result });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// Get user payment history
router.get('/history', authenticateUser, async (req, res) => {
    try {
        const history = await getUserPaymentHistory(req.user.id);
        res.json({ ok: true, data: history });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// Get current subscription status
router.get('/status', authenticateUser, async (req, res) => {
    try {
        const { getSubscriptionByUserId } = await import('../../db/models/subscriptions.model.js');
        const subscription = await getSubscriptionByUserId(req.user.id);
        res.json({ ok: true, data: subscription });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

export default router;
