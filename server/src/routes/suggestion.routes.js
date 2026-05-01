import express from 'express';
import { generateSuggestions, getSuggestions, markAsRead, rateSuggestion } from '../controllers/suggestion.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/generate', protect, generateSuggestions);
router.get('/list', protect, getSuggestions);
router.put('/:id/read', protect, markAsRead);
router.put('/:id/rate', protect, rateSuggestion);

export default router;
