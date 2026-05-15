import express from 'express';
import { getNotifications } from './notifications.controller.js';
import { authenticateUser } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateUser, getNotifications);

export default router;
