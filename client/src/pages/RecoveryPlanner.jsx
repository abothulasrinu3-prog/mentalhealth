import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Activity, CalendarClock, RefreshCw, Sparkles, Target, Wand2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatValue = (value, suffix = '') => (Number.isFinite(Number(value)) ? `${value}${suffix}` : '--');

const RecoveryPlanner = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [goal, setGoal] = useState('Sleep better and reduce daily stress');
  const [days, setDays] = useState(5);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/insights/report?days=30`);
      setReport(response.data.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load recovery data right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleGeneratePlan = async () => {
    if (!goal.trim()) return;

    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/genai/care-plan`, {
        goal,
        days
      });
      setGeneratedPlan(response.data.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to generate recovery plan right now.');
    } finally {
      setGenerating(false);
    }
  };

  const summaryCards = useMemo(() => ([
    {
      title: 'Avg Mood',
      value: formatValue(report?.summary?.averageMood, '/10'),
      subtitle: 'from your recent entries'
    },
    {
      title: 'Avg Stress',
      value: formatValue(report?.summary?.averageStress, '/10'),
      subtitle: 'higher means heavier load'
    },
    {
      title: 'Avg Sleep',
      value: formatValue(report?.summary?.averageSleep, 'h'),
      subtitle: 'recent recovery baseline'
    },
    {
      title: 'Recovery Readiness',
      value: formatValue(report?.scores?.recoveryReadiness),
      subtitle: `status: ${report?.scores?.recoveryReadinessLabel || 'unknown'}`
    }
  ]), [report]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" />
              Real data recovery flow
            </div>
            <h1 className="text-3xl font-bold">Recovery Planner</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
              This module uses your tracked moods, journal patterns, and AI insights report to build practical weekly recovery actions.
            </p>
          </div>

          <button type="button" onClick={fetchReport} className="btn-secondary inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh data
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-900/10 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.title} className="glass-card p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{card.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary-500" />
            Recommended Action Plan
          </h2>
          <div className="space-y-3">
            {(report?.actionPlan || []).map((item, index) => (
              <div key={`${item.title}-${index}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.title}</p>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                    {item.timing}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-secondary-500" />
            Suggested Experiments
          </h2>
          <div className="space-y-3">
            {(report?.experiments || []).map((experiment, index) => (
              <div key={`${experiment.title}-${index}`} className="rounded-2xl bg-secondary-50/80 dark:bg-secondary-900/10 p-4">
                <p className="font-semibold">{experiment.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{experiment.successMetric}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-amber-500" />
          Generate Personalized Care Plan
        </h2>
        <div className="grid lg:grid-cols-[1.2fr,0.4fr,0.4fr] gap-4">
          <input
            type="text"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="input-field"
            placeholder="Describe the recovery goal you want support with"
          />
          <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="input-field">
            {[3, 4, 5, 6, 7, 8, 9, 10].map((dayCount) => (
              <option key={dayCount} value={dayCount}>
                {dayCount} days
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleGeneratePlan}
            disabled={!goal.trim() || generating}
            className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CalendarClock className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {generatedPlan && (
          <div className="mt-6 rounded-2xl border border-amber-100 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/10 p-4">
            <p className="text-lg font-semibold">{generatedPlan.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{generatedPlan.summary}</p>
            <div className="grid lg:grid-cols-2 gap-3 mt-4">
              {generatedPlan.days.map((day) => (
                <div key={day.day} className="rounded-xl bg-white/80 dark:bg-gray-900/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Day {day.day}</p>
                  <p className="text-sm font-semibold mt-1">{day.phase || day.focus}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{day.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Check-in: {day.checkIn}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoveryPlanner;
