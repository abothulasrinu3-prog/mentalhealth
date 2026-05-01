import express from 'express';
import { addMood, getMoodHistory, getTodayMood, getMoodById, deleteMood } from '../controllers/mood.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, moodValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/add', protect, validate(moodValidation), addMood);
router.get('/history', protect, getMoodHistory);
router.get('/today', protect, getTodayMood);
router.get('/:id', protect, getMoodById);
router.delete('/:id', protect, deleteMood);

export default router;
