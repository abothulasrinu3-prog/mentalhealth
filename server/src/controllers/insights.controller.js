import axios from 'axios';
import { JournalEntry } from '../models/journal.model.js';
import { MoodEntry } from '../models/mood.model.js';
import {
  buildAggregatedMetrics,
  buildInsightReport,
  buildLocalModelInsights,
  buildOutcomeSnapshot,
  buildRiskAlerts,
  buildRoadmapPayload,
  buildTherapistBrief
} from '../utils/wellness-insights.js';

const normalizeServiceUrl = (value = 'http://localhost:5001') =>
  /^https?:\/\//i.test(value) ? value : `http://${value}`;

const ML_SERVICE_URL = normalizeServiceUrl(process.env.ML_SERVICE_URL);

const getScenarioPayload = (source = {}) => ({
  sleep_hours: Number(source.sleep_hours ?? source.sleepHours ?? 7),
  stress_level: Number(source.stress_level ?? source.stressLevel ?? 5),
  exercise_minutes: Number(source.exercise_minutes ?? source.exerciseMinutes ?? 15),
  screen_time: Number(source.screen_time ?? source.screenTime ?? 4),
  social_interaction: Number(source.social_interaction ?? source.socialInteraction ?? 5),
  mood_score: Number(source.mood_score ?? source.moodScore ?? 5),
  water_intake: Number(source.water_intake ?? source.waterIntake ?? 6)
});

async function requestAdvancedPrediction(payload) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict-advanced`, payload, {
      timeout: 5000
    });

    if (!response.data?.success) {
      return null;
    }

    return {
      status: response.data.source === 'heuristic-fallback' ? 'fallback' : 'online',
      availableModels: response.data.available_models || [],
      ensemble: response.data.ensemble_prediction,
      scores: response.data.wellness_scores,
      explanation: response.data.explanation,
      suggestions: response.data.suggestions || []
    };
  } catch (error) {
    return null;
  }
}

const buildPredictionPayloadFromMetrics = (metrics) =>
  getScenarioPayload({
    sleep_hours: metrics.averageSleep || 7,
    stress_level: metrics.averageStress || 5,
    exercise_minutes: metrics.averageExercise || 15,
    screen_time: metrics.averageScreenTime || 4,
    social_interaction: metrics.averageSocial || 5,
    mood_score: metrics.averageMood || 5,
    water_intake: metrics.averageWater || 6
  });

const loadInsightsData = async ({ userId, days = 30 }) => {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const [moods, journals] = await Promise.all([
    MoodEntry.find({
      userId,
      createdAt: { $gte: dateFrom }
    }).sort({ createdAt: -1 }),
    JournalEntry.find({
      userId,
      createdAt: { $gte: dateFrom }
    }).sort({ createdAt: -1 })
  ]);

  const metrics = buildAggregatedMetrics(moods);
  const scenarioPayload = buildPredictionPayloadFromMetrics(metrics);
  const mlInsights = await requestAdvancedPrediction(scenarioPayload);

  const report = buildInsightReport({
    moods,
    journals,
    mlInsights: mlInsights || buildLocalModelInsights(scenarioPayload),
    days
  });

  return { moods, journals, report };
};

export const getInsightsReport = async (req, res, next) => {
  try {
    const days = Number(req.query.days || 30);
    const { report } = await loadInsightsData({
      userId: req.user._id,
      days
    });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const getInsightsAlerts = async (req, res, next) => {
  try {
    const days = Number(req.query.days || 30);
    const { moods, journals, report } = await loadInsightsData({
      userId: req.user._id,
      days
    });

    res.json({
      success: true,
      data: buildRiskAlerts({
        moods,
        journals,
        report,
        days
      })
    });
  } catch (error) {
    next(error);
  }
};

export const getInsightsOutcomes = async (req, res, next) => {
  try {
    const days = Number(req.query.days || 30);
    const { moods, journals } = await loadInsightsData({
      userId: req.user._id,
      days
    });

    res.json({
      success: true,
      data: buildOutcomeSnapshot({
        moods,
        journals,
        days
      })
    });
  } catch (error) {
    next(error);
  }
};

export const getTherapistBriefReport = async (req, res, next) => {
  try {
    const days = Number(req.query.days || 30);
    const { moods, journals, report } = await loadInsightsData({
      userId: req.user._id,
      days
    });

    res.json({
      success: true,
      data: buildTherapistBrief({
        moods,
        journals,
        days,
        report
      })
    });
  } catch (error) {
    next(error);
  }
};

export const getInsightsRoadmap = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: buildRoadmapPayload()
    });
  } catch (error) {
    next(error);
  }
};

export const simulateInsightsScenario = async (req, res, next) => {
  try {
    const payload = getScenarioPayload(req.body);
    const mlInsights = await requestAdvancedPrediction(payload);

    res.json({
      success: true,
      data: mlInsights || buildLocalModelInsights(payload)
    });
  } catch (error) {
    next(error);
  }
};
