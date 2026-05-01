import { MoodEntry } from '../models/mood.model.js';
import { User } from '../models/user.model.js';

// @desc    Add mood entry
// @route   POST /api/mood/add
// @access  Private
export const addMood = async (req, res, next) => {
  try {
    const moodData = { ...req.body, userId: req.user._id };
    
    const mood = await MoodEntry.create(moodData);
    
    // Update streak
    await updateUserStreak(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Mood entry added successfully',
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mood history
// @route   GET /api/mood/history
// @access  Private
export const getMoodHistory = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    const moods = await MoodEntry.find({
      userId: req.user._id,
      createdAt: { $gte: dateFrom }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: moods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's mood
// @route   GET /api/mood/today
// @access  Private
export const getTodayMood = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const mood = await MoodEntry.findOne({
      userId: req.user._id,
      createdAt: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mood by ID
// @route   GET /api/mood/:id
// @access  Private
export const getMoodById = async (req, res, next) => {
  try {
    const mood = await MoodEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }

    res.json({
      success: true,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete mood entry
// @route   DELETE /api/mood/:id
// @access  Private
export const deleteMood = async (req, res, next) => {
  try {
    const mood = await MoodEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Mood entry deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update streak
const updateUserStreak = async (userId) => {
  const user = await User.findById(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (user.streak.lastEntryDate) {
    const lastEntry = new Date(user.streak.lastEntryDate);
    lastEntry.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastEntry) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      user.streak.current += 1;
    } else if (diffDays > 1) {
      user.streak.current = 1;
    }
    
    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }
  } else {
    user.streak.current = 1;
    user.streak.longest = 1;
  }
  
  user.streak.lastEntryDate = new Date();
  await user.save();
};
