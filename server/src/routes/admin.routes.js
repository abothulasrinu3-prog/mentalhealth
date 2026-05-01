import express from 'express';
import { getStats, getAllUsers } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stats', protect, getStats);
router.get('/users', protect, getAllUsers);

export default router;
