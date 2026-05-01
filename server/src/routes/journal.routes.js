import express from 'express';
import { addJournal, getJournals, searchJournals, getJournalById, updateJournal, deleteJournal } from '../controllers/journal.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, journalValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/add', protect, validate(journalValidation), addJournal);
router.get('/list', protect, getJournals);
router.get('/search', protect, searchJournals);
router.get('/:id', protect, getJournalById);
router.put('/:id', protect, updateJournal);
router.delete('/:id', protect, deleteJournal);

export default router;
