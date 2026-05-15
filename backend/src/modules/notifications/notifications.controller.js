import { getDerivedNotifications } from './notifications.service.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await getDerivedNotifications(userId);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
