import { User } from '../models/user.model.js';
import { MoodEntry } from '../models/mood.model.js';
import { JournalEntry } from '../models/journal.model.js';

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private (Admin only - simplified check)
export const getStats = async (req, res, next) => {
  try {
    // Note: In production, add proper admin role verification
    const totalUsers = await User.countDocuments();
    const totalMoodEntries = await MoodEntry.countDocuments();
    const totalJournalEntries = await JournalEntry.countDocuments();

    // Get recent signups (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentSignups = await User.countDocuments({
      createdAt: { $gte: last7Days }
    });

    // Get mood distribution across all users
    const moodDistribution = await MoodEntry.aggregate([
      {
        $group: {
          _id: '$moodLabel',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average wellness metrics
    const avgMetrics = await MoodEntry.aggregate([
      {
        $group: {
          _id: null,
          avgMood: { $avg: '$moodScore' },
          avgStress: { $avg: '$stressLevel' },
          avgSleep: { $avg: '$sleepHours' },
          avgExercise: { $avg: '$exerciseMinutes' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          recentSignups
        },
        entries: {
          mood: totalMoodEntries,
          journal: totalJournalEntries
        },
        moodDistribution,
        averageMetrics: avgMetrics[0] || {}
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments();

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        total: count
      }
    });
  } catch (error) {
    next(error);
  }
};
