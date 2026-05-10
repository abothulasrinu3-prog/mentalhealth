import express from 'express';
import {
  createTimetableItem,
  deleteTimetableItem,
  emailTimetableSummary,
  getTimetableEmailStatus,
  getTimetableSummary,
  listTimetableItems,
  logTimetableStatus,
  updateTimetableItem
} from '../controllers/timetable.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { timetableValidation, validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', protect, listTimetableItems);
router.get('/summary', protect, getTimetableSummary);
router.get('/email-status', protect, getTimetableEmailStatus);
router.post('/email-summary', protect, emailTimetableSummary);
router.post('/', protect, validate(timetableValidation), createTimetableItem);
router.put('/:id', protect, validate(timetableValidation), updateTimetableItem);
router.patch('/:id/log', protect, logTimetableStatus);
router.delete('/:id', protect, deleteTimetableItem);

export default router;
