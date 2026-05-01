import { MoodEntry } from '../models/mood.model.js';
import { JournalEntry } from '../models/journal.model.js';

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Private
export const getSummary = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    const moods = await MoodEntry.find({
      userId: req.user._id,
      createdAt: { $gte: dateFrom }
    });

    const journals = await JournalEntry.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: dateFrom }
    });

    // Calculate statistics
    const stats = calculateStats(moods);

    res.json({
      success: true,
      data: {
        ...stats,
        totalJournalEntries: journals,
        totalTrackedDays: moods.length,
        period: days
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mood trends
// @route   GET /api/analytics/mood-trends
// @access  Private
export const getMoodTrends = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    const moods = await MoodEntry.find({
      userId: req.user._id,
      createdAt: { $gte: dateFrom }
    }).sort({ createdAt: 1 });

    // Group by date
    const trends = moods.reduce((acc, mood) => {
      const date = mood.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, moods: [], avgScore: 0 };
      }
      acc[date].moods.push(mood.moodScore);
      acc[date].avgScore = acc[date].moods.reduce((a, b) => a + b, 0) / acc[date].moods.length;
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(trends)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wellness score
// @route   GET /api/analytics/wellness-score
// @access  Private
export const getWellnessScore = async (req, res, next) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const moods = await MoodEntry.find({
      userId: req.user._id,
      createdAt: { $gte: last7Days }
    });

    const score = calculateWellnessScore(moods);

    res.json({
      success: true,
      data: {
        score,
        maxScore: 100,
        period: 'last 7 days'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const calculateStats = (moods) => {
  if (moods.length === 0) {
    return {
      averageMood: 0,
      averageStress: 0,
      averageSleep: 0,
      moodDistribution: {},
      bestDay: null,
      worstDay: null,
      moodImprovement: 0
    };
  }

  const moodScores = moods.map(m => m.moodScore);
  const stressLevels = moods.map(m => m.stressLevel).filter(s => s);
  const sleepHours = moods.map(m => m.sleepHours).filter(s => s);

  const avgMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
  const avgStress = stressLevels.length > 0 ? stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length : 0;
  const avgSleep = sleepHours.length > 0 ? sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length : 0;

  // Mood distribution
  const distribution = moods.reduce((acc, mood) => {
    acc[mood.moodLabel] = (acc[mood.moodLabel] || 0) + 1;
    return acc;
  }, {});

  // Find best and worst days
  const sortedByMood = [...moods].sort((a, b) => b.moodScore - a.moodScore);
  
  return {
    averageMood: Math.round(avgMood * 10) / 10,
    averageStress: Math.round(avgStress * 10) / 10,
    averageSleep: Math.round(avgSleep * 10) / 10,
    moodDistribution: distribution,
    bestDay: sortedByMood[0]?.createdAt || null,
    worstDay: sortedByMood[sortedByMood.length - 1]?.createdAt || null,
    moodImprovement: calculateImprovement(moods)
  };
};

const calculateWellnessScore = (moods) => {
  if (moods.length === 0) return 0;

  let score = 50; // Base score

  // Mood factor (30 points)
  const avgMood = moods.reduce((a, b) => a + b.moodScore, 0) / moods.length;
  score += (avgMood / 10) * 30;

  // Sleep factor (20 points)
  const sleepEntries = moods.filter(m => m.sleepHours);
  if (sleepEntries.length > 0) {
    const avgSleep = sleepEntries.reduce((a, b) => a + b.sleepHours, 0) / sleepEntries.length;
    score += Math.min((avgSleep / 8) * 20, 20);
  }

  // Stress factor (20 points) - lower stress = higher score
  const stressEntries = moods.filter(m => m.stressLevel);
  if (stressEntries.length > 0) {
    const avgStress = stressEntries.reduce((a, b) => a + b.stressLevel, 0) / stressEntries.length;
    score += (1 - avgStress / 10) * 20;
  }

  // Exercise factor (15 points)
  const exerciseEntries = moods.filter(m => m.exerciseMinutes);
  if (exerciseEntries.length > 0) {
    const avgExercise = exerciseEntries.reduce((a, b) => a + b.exerciseMinutes, 0) / exerciseEntries.length;
    score += Math.min((avgExercise / 30) * 15, 15);
  }

  // Water factor (15 points)
  const waterEntries = moods.filter(m => m.waterIntake);
  if (waterEntries.length > 0) {
    const avgWater = waterEntries.reduce((a, b) => a + b.waterIntake, 0) / waterEntries.length;
    score += Math.min((avgWater / 8) * 15, 15);
  }

  return Math.round(Math.min(score, 100));
};

const calculateImprovement = (moods) => {
  if (moods.length < 7) return 0;
  
  const sorted = [...moods].sort((a, b) => a.createdAt - b.createdAt);
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b.moodScore, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b.moodScore, 0) / secondHalf.length;
  
  return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
};
