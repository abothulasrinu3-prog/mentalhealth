import express from 'express';
import {
  generateGenAIChat,
  generateGenAICarePlan,
  generateGenAIReframe,
  generateGenAIVisualConcept,
  getGenAIStack
} from '../controllers/genai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stack', protect, getGenAIStack);
router.post('/chat', protect, generateGenAIChat);
router.post('/care-plan', protect, generateGenAICarePlan);
router.post('/visual-concept', protect, generateGenAIVisualConcept);
router.post('/reframe', protect, generateGenAIReframe);

export default router;
