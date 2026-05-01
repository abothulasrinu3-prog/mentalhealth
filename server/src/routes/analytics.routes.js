import express from 'express';
import { getSummary, getMoodTrends, getWellnessScore } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/summary', protect, getSummary);
router.get('/mood-trends', protect, getMoodTrends);
router.get('/wellness-score', protect, getWellnessScore);

export default router;
