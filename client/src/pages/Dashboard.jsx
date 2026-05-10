import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Smile, BookHeart, TrendingUp, Sparkles, Calendar, 
  Droplets, Moon, Activity, Flame, ChevronRight, Brain, AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import PageExperience3D from '../components/PageExperience3D';
import { getLocalMoodHistory, getLocalMoodStats, getLocalTodayMood } from '../utils/localMoodStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayMood, setTodayMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moodPrediction, setMoodPrediction] = useState(null);

  // Mood Prediction AI
  const predictMood = (moodHistory) => {
    if (moodHistory.length < 3) return null;

    // Simple AI prediction based on patterns
    const recentMoods = moodHistory.slice(-7);
    const avgMood = recentMoods.reduce((sum, mood) => sum + mood.moodScore, 0) / recentMoods.length;
    const trend = recentMoods.length > 1 ? 
      recentMoods[recentMoods.length - 1].moodScore - recentMoods[0].moodScore : 0;

    // Factors affecting mood
    const stressFactor = recentMoods.reduce((sum, mood) => sum + (mood.stressLevel || 0), 0) / recentMoods.length;
    const sleepFactor = recentMoods.reduce((sum, mood) => sum + (mood.sleepHours || 0), 0) / recentMoods.length;

    // Prediction algorithm
    let predictedMood = avgMood + (trend * 0.3) - (stressFactor * 0.2) + ((sleepFactor - 7) * 0.1);
    predictedMood = Math.max(1, Math.min(10, predictedMood));

    // Determine mood label
    let moodLabel = 'neutral';
    if (predictedMood >= 8) moodLabel = 'very-happy';
    else if (predictedMood >= 7) moodLabel = 'happy';
    else if (predictedMood >= 6) moodLabel = 'calm';
    else if (predictedMood >= 5) moodLabel = 'neutral';
    else if (predictedMood >= 4) moodLabel = 'sad';
    else if (predictedMood >= 3) moodLabel = 'anxious';
    else if (predictedMood >= 2) moodLabel = 'angry';
    else moodLabel = 'exhausted';

    // Generate recommendations
    let recommendations = [];
    if (predictedMood < 5) {
      recommendations.push('Try a gentle walk or light exercise');
      recommendations.push('Connect with a friend or loved one');
      recommendations.push('Practice mindfulness or meditation');
    } else if (predictedMood > 7) {
      recommendations.push('Maintain your positive routine');
      recommendations.push('Share your good mood with others');
      recommendations.push('Document what\'s working well');
    } else {
      recommendations.push('Focus on self-care activities');
      recommendations.push('Maintain consistent sleep schedule');
      recommendations.push('Practice gratitude');
    }

    return {
      predictedScore: Math.round(predictedMood * 10) / 10,
      moodLabel,
      confidence: Math.min(95, 60 + (moodHistory.length * 5)),
      trend: trend > 0.5 ? 'improving' : trend < -0.5 ? 'declining' : 'stable',
      recommendations,
      factors: {
        stress: stressFactor > 5 ? 'high' : stressFactor > 3 ? 'moderate' : 'low',
        sleep: sleepFactor < 6 ? 'poor' : sleepFactor < 8 ? 'adequate' : 'good'
      }
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, todayRes, historyRes, suggestionsRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/summary?days=7`),
        axios.get(`${API_URL}/mood/today`),
        axios.get(`${API_URL}/mood/history?days=7`),
        axios.get(`${API_URL}/suggestions/list?limit=3`)
      ]);

      setStats(statsRes.data.data);
      setTodayMood(todayRes.data.data);
      setMoodHistory(historyRes.data.data);
      setSuggestions(suggestionsRes.data.data);
      
      // Generate mood prediction
      const prediction = predictMood(historyRes.data.data);
      setMoodPrediction(prediction);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const localHistory = getLocalMoodHistory(7);
      setStats(getLocalMoodStats(7));
      setTodayMood(getLocalTodayMood());
      setMoodHistory(localHistory);
      setSuggestions([]);
      setMoodPrediction(predictMood(localHistory.slice().reverse()));
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (label) => {
    const emojis = {
      'very-happy': '😄', 'happy': '🙂', 'calm': '😌',
      'neutral': '😐', 'sad': '😔', 'anxious': '😰',
      'angry': '😠', 'exhausted': '😫'
    };
    return emojis[label] || '😐';
  };

  const getMoodColor = (label) => {
    const colors = {
      'very-happy': 'bg-emerald-100 text-emerald-700',
      'happy': 'bg-cyan-100 text-cyan-700',
      'calm': 'bg-violet-100 text-violet-700',
      'neutral': 'bg-gray-100 text-gray-700',
      'sad': 'bg-slate-200 text-slate-700',
      'anxious': 'bg-amber-100 text-amber-700',
      'angry': 'bg-red-100 text-red-700',
      'exhausted': 'bg-gray-200 text-gray-700'
    };
    return colors[label] || 'bg-gray-100 text-gray-700';
  };

  const chartData = moodHistory.slice().reverse().map(mood => ({
    date: new Date(mood.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
    mood: mood.moodScore,
    stress: mood.stressLevel || 0,
    sleep: mood.sleepHours || 0
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8 animate-fade-in">
      <PageExperience3D
        variant="dashboard"
        eyebrow="Today at a glance"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'friend'}`}
        description="Your wellness command center now starts with a live-feeling 3D snapshot of mood, recovery, and next best actions."
        metrics={['Mood forecast', 'Quick actions', 'AI suggestions']}
      />
      {/* Header */}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="break-words text-2xl font-bold sm:text-3xl">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your mental wellness overview
          </p>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          {user?.streak?.current > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 rounded-lg">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">{user.streak.current} day streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Mood Prediction AI */}
      {moodPrediction && (
        <motion.div 
          className="glass-card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex min-w-0 flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              Tomorrow's Mood Prediction
            </h2>
            <span className="text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
              {moodPrediction.confidence}% confidence
            </span>
          </div>

          <div className="grid min-w-0 gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{getMoodEmoji(moodPrediction.moodLabel)}</span>
                <div>
                  <p className="text-2xl font-bold capitalize">{moodPrediction.moodLabel.replace('-', ' ')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Score: {moodPrediction.predictedScore}/10
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  moodPrediction.trend === 'improving' ? 'bg-green-100 text-green-700' :
                  moodPrediction.trend === 'declining' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {moodPrediction.trend}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  based on your patterns
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stress:</span>
                  <span className={`text-sm font-medium ${
                    moodPrediction.factors.stress === 'high' ? 'text-red-600' :
                    moodPrediction.factors.stress === 'moderate' ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {moodPrediction.factors.stress}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sleep:</span>
                  <span className={`text-sm font-medium ${
                    moodPrediction.factors.sleep === 'poor' ? 'text-red-600' :
                    moodPrediction.factors.sleep === 'adequate' ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {moodPrediction.factors.sleep}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Recommendations
              </h3>
              <div className="space-y-2">
                {moodPrediction.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <span className="text-purple-500 text-sm">•</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <p className="text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              This is an AI prediction based on your recent mood patterns. Actual mood may vary.
            </p>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Cards */}
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass-card min-w-0 p-4 sm:p-6 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <Smile className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Today's Mood</span>
          </div>
          <div className="flex items-center gap-2">
            {todayMood ? (
              <>
                <span className="text-3xl">{getMoodEmoji(todayMood.moodLabel)}</span>
                <span className="text-lg font-semibold capitalize">{todayMood.moodLabel.replace('-', ' ')}</span>
              </>
            ) : (
              <span className="text-gray-400">Not tracked</span>
            )}
          </div>
        </div>

        <div className="glass-card min-w-0 p-4 sm:p-6 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Mood</span>
          </div>
          <div className="text-2xl font-bold">
            {stats?.averageMood ? `${stats.averageMood}/10` : '-'}
          </div>
        </div>

        <div className="glass-card min-w-0 p-4 sm:p-6 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Moon className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Sleep</span>
          </div>
          <div className="text-2xl font-bold">
            {stats?.averageSleep ? `${stats.averageSleep}h` : '-'}
          </div>
        </div>

        <div className="glass-card min-w-0 p-4 sm:p-6 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Wellness Score</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {stats?.wellnessScore || '-'}/100
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        {/* Mood Chart */}
        <div className="min-w-0 lg:col-span-2 glass-card p-4 sm:p-6">
          <div className="flex min-w-0 flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Mood & Stress Trends
            </h2>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          
          {chartData.length > 0 ? (
            <div className="h-64 min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis domain={[0, 10]} stroke="#9ca3af" />
                  <Tooltip />
                  <Area type="monotone" dataKey="mood" stroke="#0ea5e9" fill="url(#moodGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="stress" stroke="#f59e0b" fill="url(#stressGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No mood data yet. Start tracking today!
            </div>
          )}
        </div>

        {/* AI Suggestions */}
        <div className="glass-card min-w-0 p-4 sm:p-6">
          <div className="flex min-w-0 flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary-500" />
              AI Suggestions
            </h2>
          </div>
          
          <div className="space-y-4">
            {suggestions.length > 0 ? (
              suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.suggestionText}</p>
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 capitalize">
                    {suggestion.category}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Track your mood to get personalized suggestions</p>
              </div>
            )}
          </div>
          
          <Link to="/suggestions" className="mt-4 flex items-center justify-center gap-2 text-primary-500 hover:text-primary-600 font-medium">
            View all suggestions
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link to="/mood-tracker" className="glass-card min-w-0 p-4 sm:p-6 card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Smile className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Track Mood</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Log how you feel</p>
          </div>
        </Link>

        <Link to="/journal" className="glass-card min-w-0 p-4 sm:p-6 card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <BookHeart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Write Journal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Express yourself</p>
          </div>
        </Link>

        <Link to="/analytics" className="glass-card min-w-0 p-4 sm:p-6 card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">View Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">See your patterns</p>
          </div>
        </Link>

        <Link to="/ai-insights" className="glass-card min-w-0 p-4 sm:p-6 card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AI Insights Lab</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Run model-backed wellness analysis</p>
          </div>
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Disclaimer:</strong> MindCare AI is for self-tracking and wellness support only. 
          It does not replace professional medical or psychological diagnosis or treatment. 
          If you feel unsafe or in crisis, please contact emergency services or a mental health professional immediately.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

