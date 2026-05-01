import express from 'express';
import {
  analyzeFoodNutrition,
  getStatus,
  searchRecipes
} from '../controllers/integrations.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/status', protect, getStatus);
router.post('/nutrition/analyze', protect, analyzeFoodNutrition);
router.get('/nutrition/recipes', protect, searchRecipes);

export default router;
