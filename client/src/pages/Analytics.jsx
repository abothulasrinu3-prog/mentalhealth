import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import PageExperience3D from '../components/PageExperience3D';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const timeRanges = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 90 Days', value: 90 }
];

const moodColors = {
  'very-happy': '#10b981', 'happy': '#22d3ee', 'calm': '#8b5cf6',
  'neutral': '#9ca3af', 'sad': '#64748b', 'anxious': '#f59e0b',
  'angry': '#ef4444', 'exhausted': '#6b7280'
};

const Analytics = () => {
  const [timeRange, setTimeRange] = useState(7);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryRes, trendsRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/summary?days=${timeRange}`),
        axios.get(`${API_URL}/analytics/mood-trends?days=${timeRange}`),
        axios.get(`${API_URL}/mood/history?days=${timeRange}`)
      ]);

      setStats(summaryRes.data.data);
      setTrends(trendsRes.data.data);
      setMoodHistory(historyRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const moodDistribution = stats?.moodDistribution ? 
    Object.entries(stats.moodDistribution).map(([name, value]) => ({
      name: name.replace('-', ' '),
      value,
      color: moodColors[name] || '#9ca3af'
    })) : [];

  const trendData = trends.map(t => ({
    date: t.date,
    mood: t.avgScore.toFixed(1),
    entries: t.moods.length
  }));

  const sleepVsMood = moodHistory.slice(-14).map(m => ({
    date: new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sleep: m.sleepHours || 0,
    mood: m.moodScore
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <PageExperience3D
        variant="analytics"
        eyebrow="Pattern analytics"
        title="Analytics"
        description="A richer 3D overview of mood, sleep, stress, and progress patterns across your selected timeline."
        metrics={['Trend maps', 'Mood mix', `${timeRange} day view`]}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary-500" />
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Deep insights into your mental wellness patterns</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="input-field pr-10 appearance-none cursor-pointer"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Mood', value: stats?.averageMood ? `${stats.averageMood}/10` : '-', color: 'bg-primary-100 text-primary-700' },
          { label: 'Avg Stress', value: stats?.averageStress ? `${stats.averageStress}/10` : '-', color: 'bg-amber-100 text-amber-700' },
          { label: 'Avg Sleep', value: stats?.averageSleep ? `${stats.averageSleep}h` : '-', color: 'bg-violet-100 text-violet-700' },
          { label: 'Mood Improvement', value: stats?.moodImprovement ? `${stats.moodImprovement > 0 ? '+' : ''}${stats.moodImprovement}%` : '-', color: stats?.moodImprovement > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 text-center">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${stat.color}`}>
              {stat.label}
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mood Trends */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            Mood Trends
          </h3>
          {trendData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis domain={[0, 10]} stroke="#9ca3af" />
                  <Tooltip />
                  <Area type="monotone" dataKey="mood" stroke="#0ea5e9" fill="url(#colorMood)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Mood Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-secondary-500" />
            Mood Distribution
          </h3>
          {moodDistribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Sleep vs Mood */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-500" />
            Sleep vs Mood Correlation
          </h3>
          {sleepVsMood.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepVsMood}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sleep" fill="#8b5cf6" name="Sleep (hours)" />
                  <Bar dataKey="mood" fill="#0ea5e9" name="Mood Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Track both sleep and mood to see correlation
            </div>
          )}
        </div>

        {/* Additional Stats */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed Statistics</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Journal Entries', value: stats?.totalJournalEntries || 0 },
              { label: 'Days Tracked', value: stats?.totalTrackedDays || 0 },
              { label: 'Best Day', value: stats?.bestDay ? new Date(stats.bestDay).toLocaleDateString() : '-' },
              { label: 'Most Common Mood', value: moodDistribution.length > 0 ? moodDistribution[0].name : '-' }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
