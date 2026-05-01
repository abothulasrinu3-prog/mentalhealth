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
