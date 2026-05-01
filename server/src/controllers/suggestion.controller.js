import { SuggestionLog } from '../models/suggestion.model.js';
import { MoodEntry } from '../models/mood.model.js';
import axios from 'axios';

// @desc    Generate suggestions
// @route   POST /api/suggestions/generate
// @access  Private
export const generateSuggestions = async (req, res, next) => {
  try {
    // Get recent mood data
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentMoods = await MoodEntry.find({
      userId: req.user._id,
      createdAt: { $gte: last7Days }
    }).sort({ createdAt: -1 });

    // Generate rule-based suggestions
    const suggestions = generateRuleBasedSuggestions(recentMoods);

    // Try to get ML-based prediction if service is available
    try {
      const mlPrediction = await getMLPrediction(recentMoods, req.user._id);
      if (mlPrediction) {
        suggestions.push(...mlPrediction.suggestions);
      }
    } catch (mlError) {
      console.log('ML service unavailable, using rule-based suggestions only');
    }

    // Save suggestions
    const savedSuggestions = await Promise.all(
      suggestions.map(suggestion =>
        SuggestionLog.create({
          userId: req.user._id,
          suggestionText: suggestion.text,
          category: suggestion.category
        })
      )
    );

    res.json({
      success: true,
      data: savedSuggestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's suggestions
// @route   GET /api/suggestions/list
// @access  Private
export const getSuggestions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    
    const query = { userId: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;

    const suggestions = await SuggestionLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await SuggestionLog.countDocuments(query);

    res.json({
      success: true,
      data: suggestions,
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

// @desc    Mark suggestion as read
// @route   PUT /api/suggestions/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const suggestion = await SuggestionLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    res.json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate suggestion helpfulness
// @route   PUT /api/suggestions/:id/rate
// @access  Private
export const rateSuggestion = async (req, res, next) => {
  try {
    const { isHelpful } = req.body;
    
    const suggestion = await SuggestionLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isHelpful },
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    res.json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    next(error);
  }
};

// Rule-based suggestion engine
const generateRuleBasedSuggestions = (moods) => {
  const suggestions = [];
  
  if (moods.length === 0) {
    suggestions.push({
      text: "Start tracking your mood daily to receive personalized wellness suggestions!",
      category: "general"
    });
    return suggestions;
  }

  const avgMood = moods.reduce((a, b) => a + b.moodScore, 0) / moods.length;
  const sleepEntries = moods.filter(m => m.sleepHours);
  const stressEntries = moods.filter(m => m.stressLevel);
  const exerciseEntries = moods.filter(m => m.exerciseMinutes);
  const waterEntries = moods.filter(m => m.waterIntake);
  const screenEntries = moods.filter(m => m.screenTime);

  // Sleep-based suggestions
  if (sleepEntries.length > 0) {
    const avgSleep = sleepEntries.reduce((a, b) => a + b.sleepHours, 0) / sleepEntries.length;
    if (avgSleep < 6) {
      suggestions.push({
        text: "Your sleep is below 6 hours on average. Try going to bed 30 minutes earlier tonight and create a relaxing bedtime routine.",
        category: "sleep"
      });
    } else if (avgSleep > 9) {
      suggestions.push({
        text: "You're getting plenty of sleep! Quality matters too - ensure your sleep environment is dark and cool.",
        category: "sleep"
      });
    }
  }

  // Stress-based suggestions
  if (stressEntries.length > 0) {
    const avgStress = stressEntries.reduce((a, b) => a + b.stressLevel, 0) / stressEntries.length;
    if (avgStress > 7) {
      suggestions.push({
        text: "You've been experiencing high stress. Try a 5-minute breathing exercise: inhale for 4 counts, hold for 4, exhale for 6.",
        category: "stress-reduction"
      });
    }
  }

  // Exercise-based suggestions
  if (exerciseEntries.length > 0) {
    const avgExercise = exerciseEntries.reduce((a, b) => a + b.exerciseMinutes, 0) / exerciseEntries.length;
    if (avgExercise < 20) {
      suggestions.push({
        text: "Try to add 15 minutes of light activity today - a short walk can boost your mood significantly.",
        category: "physical-activity"
      });
    } else {
      suggestions.push({
        text: "Great job staying active! Regular exercise is linked to better mental health.",
        category: "physical-activity"
      });
    }
  }

  // Hydration suggestions
  if (waterEntries.length > 0) {
    const avgWater = waterEntries.reduce((a, b) => a + b.waterIntake, 0) / waterEntries.length;
    if (avgWater < 6) {
      suggestions.push({
        text: "Keep a water bottle nearby and aim for 8 glasses today. Dehydration can affect your mood and energy.",
        category: "hydration"
      });
    }
  }

  // Screen time suggestions
  if (screenEntries.length > 0) {
    const avgScreen = screenEntries.reduce((a, b) => a + b.screenTime, 0) / screenEntries.length;
    if (avgScreen > 8) {
      suggestions.push({
        text: "Your screen time is quite high. Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.",
        category: "general"
      });
    }
  }

  // Mood-based suggestions
  if (avgMood < 4) {
    suggestions.push({
      text: "Your mood has been low. Consider journaling about what's on your mind or reaching out to a trusted friend.",
      category: "journaling"
    });
    suggestions.push({
      text: "Remember: difficult emotions are temporary. Try naming 3 things you're grateful for right now.",
      category: "motivation"
    });
  } else if (avgMood >= 7) {
    suggestions.push({
      text: "Your mood has been positive! Take a moment to appreciate what's going well in your life.",
      category: "motivation"
    });
  }

  // Default suggestion if none generated
  if (suggestions.length === 0) {
    suggestions.push({
      text: "Keep up your current routine! Consistent tracking helps us provide better insights.",
      category: "general"
    });
  }

  return suggestions;
};

// Get ML prediction from Python service
const getMLPrediction = async (moods, userId) => {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
  
  // Prepare features for ML model
  const features = {
    sleep_hours: moods[0]?.sleepHours || 7,
    stress_level: moods[0]?.stressLevel || 5,
    exercise_minutes: moods[0]?.exerciseMinutes || 0,
    screen_time: moods[0]?.screenTime || 4,
    social_interaction: moods[0]?.socialInteraction || 5,
    mood_score: moods[0]?.moodScore || 5,
    water_intake: moods[0]?.waterIntake || 6
  };

  const response = await axios.post(`${mlServiceUrl}/predict`, features, {
    timeout: 5000
  });

  return response.data;
};
