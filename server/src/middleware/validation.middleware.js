import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  };
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().normalizeEmail().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const loginValidation = [
  body('email').trim().normalizeEmail().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const moodValidation = [
  body('moodLabel').isIn(['very-happy', 'happy', 'calm', 'neutral', 'sad', 'anxious', 'angry', 'exhausted'])
    .withMessage('Invalid mood label'),
  body('moodScore').isInt({ min: 1, max: 10 }).withMessage('Mood score must be 1-10')
];

export const journalValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
];

export const timetableValidation = [
  body('title').trim().notEmpty().withMessage('Activity title is required'),
  body('category')
    .optional()
    .isIn([
      'study',
      'meditation',
      'workout',
      'sleep',
      'medication',
      'water',
      'mood',
      'therapy',
      'affirmation',
      'breathing',
      'journal',
      'other'
    ])
    .withMessage('Invalid activity category'),
  body('time')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Time must be in HH:mm format'),
  body('endTime')
    .optional({ checkFalsy: true })
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('End time must be in HH:mm format'),
  body('daysOfWeek')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one reminder day is required'),
  body('daysOfWeek.*')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Reminder days must be from 0 to 6'),
  body('note').optional().isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters'),
  body('workingProblem').optional().isLength({ max: 500 }).withMessage('Working problem cannot exceed 500 characters')
];
