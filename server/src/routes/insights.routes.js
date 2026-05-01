import express from 'express';
import {
  getInsightsAlerts,
  getInsightsOutcomes,
  getInsightsReport,
  getInsightsRoadmap,
  getTherapistBriefReport,
  simulateInsightsScenario
} from '../controllers/insights.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/report', protect, getInsightsReport);
router.get('/alerts', protect, getInsightsAlerts);
router.get('/outcomes', protect, getInsightsOutcomes);
router.get('/therapist-brief', protect, getTherapistBriefReport);
router.get('/roadmap', protect, getInsightsRoadmap);
router.post('/simulate', protect, simulateInsightsScenario);

export default router;
