import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Brain,
  Cpu,
  Flame,
  Lightbulb,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import PageExperience3D from '../components/PageExperience3D';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const initialScenario = {
  sleep_hours: 7,
  stress_level: 5,
  exercise_minutes: 20,
  screen_time: 5,
  social_interaction: 6,
  mood_score: 6,
  water_intake: 6
};

const scoreMeta = {
  wellnessScore: { label: 'Wellness Score', accent: 'from-cyan-500 to-sky-500', icon: Activity },
  burnoutRisk: { label: 'Burnout Risk', accent: 'from-amber-500 to-orange-500', icon: Flame },
  anxietyLoad: { label: 'Anxiety Load', accent: 'from-rose-500 to-pink-500', icon: AlertCircle },
  recoveryReadiness: { label: 'Recovery Readiness', accent: 'from-emerald-500 to-teal-500', icon: Shield },
  resilienceScore: { label: 'Resilience Score', accent: 'from-violet-500 to-indigo-500', icon: Target }
};

const riskTone = (label) => {
  if (label === 'high' || label === 'fragile') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  if (label === 'moderate' || label === 'building') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
};

const formatLabel = (value = '') =>
  value
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const AIInsights = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [scenario, setScenario] = useState(initialScenario);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [error, setError] = useState('');

  const fetchInsights = async (withRefresh = false) => {
    if (withRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [reportResponse, roadmapResponse] = await Promise.all([
        axios.get(`${API_URL}/insights/report?days=30`),
        axios.get(`${API_URL}/insights/roadmap`)
      ]);

      setReport(reportResponse.data.data);
      setRoadmap(roadmapResponse.data.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load AI insights right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const timelineData = (report?.timeline || []).map((point) => ({
    ...point,
    shortDate: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const radarData = report
    ? [
        { metric: 'Wellness', value: report.scores.wellnessScore },
        { metric: 'Recovery', value: report.scores.recoveryReadiness },
        { metric: 'Resilience', value: report.scores.resilienceScore },
        { metric: 'Burnout', value: 100 - report.scores.burnoutRisk },
        { metric: 'Calm Load', value: 100 - report.scores.anxietyLoad }
      ]
    : [];

  const topRoadmapCategories = (roadmap?.categories || []).slice(0, 6);

  const runScenario = async () => {
    setScenarioLoading(true);
    try {
      const response = await axios.post(`${API_URL}/insights/simulate`, scenario);
      setSimulation(response.data.data);
      setError('');
    } catch (requestError) {
      setSimulation(null);
      setError(requestError.response?.data?.message || 'Scenario simulation failed.');
    } finally {
      setScenarioLoading(false);
    }
  };

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
        variant="insights"
        eyebrow="AI intelligence layer"
        title="AI Insights Lab"
        description="Model-backed wellness analysis with animated signal depth, forecast context, and action planning for your care routine."
        metrics={['ML signals', '30-day lens', 'Care roadmap']}
      />
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            High-impact AI and ML workspace
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary-500" />
            AI Insights Lab
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
            This page combines your mood data, journal themes, and model-backed wellness analysis into one operational dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-2 rounded-xl text-sm font-medium ${report?.ml?.status === 'online' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
            {report?.ml?.status === 'online' ? 'ML service connected' : 'Fallback intelligence active'}
          </span>
          <button
            type="button"
            onClick={() => fetchInsights(true)}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-900/10 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {Object.entries(scoreMeta).map(([key, meta]) => {
          const Icon = meta.icon;
          const labelKey = `${key}Label`;
          const badge = report?.scores?.[labelKey];

          return (
            <div key={key} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.accent} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {badge && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${riskTone(badge)}`}>
                    {formatLabel(badge)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{meta.label}</p>
              <p className="text-3xl font-bold mt-1">{report?.scores?.[key] ?? 0}</p>
            </div>
          );
        })}
      </div>

      <div className="grid xl:grid-cols-[1.2fr,0.8fr] gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Mood and recovery timeline
            </h2>
            <span className="text-sm text-gray-500">Last 30 days</span>
          </div>

          {timelineData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="shortDate" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="#0ea5e9" strokeWidth={3} dot={false} name="Mood" />
                  <Line type="monotone" dataKey="stress" stroke="#f97316" strokeWidth={2} dot={false} name="Stress" />
                  <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Sleep" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              Add mood entries to unlock charted AI analysis.
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-secondary-500" />
              Balance profile
            </h2>
            <span className="text-sm text-gray-500">
              Tomorrow mood: {formatLabel(report?.outlook?.tomorrowMoodLabel || 'neutral')}
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Profile" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.35} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/80 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Priority focus</p>
              <p className="font-semibold mt-1">{formatLabel(report?.outlook?.priorityFocus || 'recovery')}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/80 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Sleep debt</p>
              <p className="font-semibold mt-1">{report?.scores?.sleepDebtHours || 0} hrs / week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="glass-card p-6 xl:col-span-1">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-5">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Key signals
          </h2>

          <div className="space-y-4">
            {(report?.signals || []).map((signal, index) => (
              <div key={`${signal.title}-${index}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{signal.title}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${riskTone(signal.direction === 'positive' ? 'strong' : signal.direction === 'warning' ? 'high' : 'building')}`}>
                    {formatLabel(signal.direction)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{signal.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 xl:col-span-1">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Journal and trigger analysis
          </h2>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Top themes</p>
              <div className="flex flex-wrap gap-2">
                {(report?.journalAnalysis?.topThemes || []).map((theme) => (
                  <span key={theme.label} className="px-3 py-2 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 text-sm">
                    {formatLabel(theme.label)} ({theme.count})
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Likely triggers</p>
              <div className="space-y-2">
                {(report?.journalAnalysis?.topTriggers || []).map((trigger) => (
                  <div key={trigger.label} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800/80 px-4 py-3">
                    <span>{formatLabel(trigger.label)}</span>
                    <span className="text-sm text-gray-500">{trigger.count} hits</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Protective factors</p>
              <div className="space-y-2">
                {(report?.journalAnalysis?.protectiveFactors || []).map((factor) => (
                  <div key={factor.label} className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-900/10 px-4 py-3">
                    <span>{formatLabel(factor.label)}</span>
                    <span className="text-sm text-emerald-600 dark:text-emerald-300">{factor.count} signals</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 xl:col-span-1">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-5">
            <Cpu className="w-5 h-5 text-cyan-500" />
            Model layer
          </h2>

          <div className="space-y-4">
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/80 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ensemble prediction</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xl font-semibold">{formatLabel(report?.ml?.ensemble?.label || 'low risk')}</p>
                <span className="text-sm text-gray-500">{report?.ml?.ensemble?.confidence || 0}% confidence</span>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/80 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Available models</p>
              <div className="flex flex-wrap gap-2">
                {(report?.ml?.availableModels || []).length > 0 ? (
                  report.ml.availableModels.map((modelName) => (
                    <span key={modelName} className="px-3 py-2 rounded-full bg-white dark:bg-gray-900 text-sm border border-gray-200 dark:border-gray-700">
                      {formatLabel(modelName)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Using heuristic fallback</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Model-backed next steps</p>
              <div className="space-y-2">
                {(report?.ml?.suggestions || []).map((suggestion, index) => (
                  <div key={`${suggestion.category}-${index}`} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-sm">{suggestion.text}</p>
                    <span className="inline-flex mt-2 text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                      {formatLabel(suggestion.category)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[0.95fr,1.05fr] gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-5">
            <Target className="w-5 h-5 text-emerald-500" />
            Weekly action plan
          </h2>

          <div className="space-y-4">
            {(report?.actionPlan || []).map((item, index) => (
              <div key={`${item.title}-${index}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.title}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {item.timing}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.action}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Recommended experiments</p>
            <div className="space-y-3">
              {(report?.experiments || []).map((experiment, index) => (
                <div key={`${experiment.title}-${index}`} className="rounded-xl bg-primary-50 dark:bg-primary-900/10 px-4 py-3">
                  <p className="font-medium">{experiment.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{experiment.successMetric}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary-500" />
                What-if simulator
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Adjust a scenario and test how the model layer reacts.
              </p>
            </div>
            <button type="button" onClick={runScenario} disabled={scenarioLoading} className="btn-primary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${scenarioLoading ? 'animate-spin' : ''}`} />
              Simulate
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(scenario).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">{formatLabel(key)}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(event) =>
                    setScenario((current) => ({
                      ...current,
                      [key]: Number(event.target.value)
                    }))
                  }
                  className="input-field"
                />
              </div>
            ))}
          </div>

          {simulation && (
            <div className="mt-6 grid lg:grid-cols-[0.9fr,1.1fr] gap-4">
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/80 p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">Scenario result</p>
                <p className="text-2xl font-bold mt-2">{formatLabel(simulation.ensemble?.label || 'low risk')}</p>
                <p className="text-sm text-gray-500 mt-1">{simulation.ensemble?.confidence || 0}% confidence</p>

                <div className="mt-5 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Overall', value: simulation.scores?.overall || 0 },
                        { name: 'Burnout', value: simulation.scores?.burnoutRisk || 0 },
                        { name: 'Anxiety', value: simulation.scores?.anxietyRisk || 0 },
                        { name: 'Recovery', value: simulation.scores?.recoveryScore || 0 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/80 p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Scenario suggestions</p>
                <div className="space-y-3">
                  {(simulation.suggestions || []).map((suggestion, index) => (
                    <div key={`${suggestion.category}-${index}`} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900/70">
                      <p className="text-sm">{suggestion.text}</p>
                      <span className="inline-flex mt-2 text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                        {formatLabel(suggestion.category)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary-500" />
              Feature expansion roadmap
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {roadmap?.totalIdeas || 0} high-impact ideas grouped into build-ready modules.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {topRoadmapCategories.map((category) => (
            <div key={category.category} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{category.category}</h3>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-secondary-50 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-300">
                  {category.count} ideas
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{category.description}</p>
              <div className="mt-4 space-y-2">
                {category.items.slice(0, 5).map((item) => (
                  <div key={item.title} className="rounded-xl bg-gray-50 dark:bg-gray-800/80 px-3 py-2 text-sm">
                    {item.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/10 p-4 text-sm text-amber-800 dark:text-amber-200">
        <strong>Important:</strong> These AI and ML features provide self-guided wellness support and pattern awareness. They are not a substitute for professional diagnosis, therapy, or emergency care.
      </div>
    </div>
  );
};

export default AIInsights;
