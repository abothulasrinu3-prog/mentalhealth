import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  BookOpenText,
  CheckCircle2,
  Circle,
  ClipboardList,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Wand2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CHECKLIST_KEY_PREFIX = 'weekly_review_checklist';

const getWeekStartKey = () => {
  const now = new Date();
  const mondayAligned = new Date(now);
  const day = (mondayAligned.getDay() + 6) % 7;
  mondayAligned.setDate(mondayAligned.getDate() - day);
  mondayAligned.setHours(0, 0, 0, 0);
  return mondayAligned.toISOString().slice(0, 10);
};

const toLabel = (value = '') =>
  String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const formatMetric = (value, suffix = '') =>
  Number.isFinite(Number(value)) ? `${value}${suffix}` : '--';

const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const WeeklyReview = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [journals, setJournals] = useState([]);
  const [checklist, setChecklist] = useState({});
  const [nextWeekPlan, setNextWeekPlan] = useState(null);

  const weekStartKey = useMemo(() => getWeekStartKey(), []);
  const checklistStorageKey = `${CHECKLIST_KEY_PREFIX}_${weekStartKey}`;

  const fetchData = async (withRefresh = false) => {
    if (withRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [reportResponse, journalResponse] = await Promise.all([
        axios.get(`${API_URL}/insights/report?days=14`),
        axios.get(`${API_URL}/journal/list?limit=10&page=1`)
      ]);

      setReport(reportResponse.data.data);
      setJournals(journalResponse.data.data || []);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load weekly review right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const checklistItems = useMemo(() => {
    const actionItems = (report?.actionPlan || []).map((item, index) => ({
      id: `action-${index}`,
      title: item.title,
      detail: item.action,
      timing: item.timing
    }));

    const experimentItems = (report?.experiments || []).map((item, index) => ({
      id: `experiment-${index}`,
      title: item.title,
      detail: item.successMetric,
      timing: 'Experiment'
    }));

    return [...actionItems, ...experimentItems].slice(0, 7);
  }, [report]);

  useEffect(() => {
    if (!checklistItems.length) return;

    const raw = localStorage.getItem(checklistStorageKey);
    const saved = raw ? JSON.parse(raw) : {};
    const nextChecklist = {};
    checklistItems.forEach((item) => {
      nextChecklist[item.id] = Boolean(saved[item.id]);
    });
    setChecklist(nextChecklist);
  }, [checklistItems, checklistStorageKey]);

  const toggleChecklist = (id) => {
    setChecklist((current) => {
      const updated = { ...current, [id]: !current[id] };
      localStorage.setItem(checklistStorageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const completedCount = checklistItems.filter((item) => checklist[item.id]).length;
  const completionRate = checklistItems.length
    ? Math.round((completedCount / checklistItems.length) * 100)
    : 0;

  const summaryCards = [
    {
      label: 'Average Mood',
      value: formatMetric(report?.summary?.averageMood, '/10'),
      tone: 'text-sky-600'
    },
    {
      label: 'Average Stress',
      value: formatMetric(report?.summary?.averageStress, '/10'),
      tone: 'text-rose-600'
    },
    {
      label: 'Average Sleep',
      value: formatMetric(report?.summary?.averageSleep, 'h'),
      tone: 'text-indigo-600'
    },
    {
      label: 'Consistency',
      value: formatMetric(report?.summary?.consistencyScore, '%'),
      tone: 'text-amber-600'
    },
    {
      label: 'Recovery Readiness',
      value: formatMetric(report?.scores?.recoveryReadiness),
      tone: 'text-emerald-600'
    }
  ];

  const generateNextWeekPlan = async () => {
    if (!report) return;

    const focus = toLabel(report.outlook?.priorityFocus || 'recovery');
    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/genai/care-plan`, {
        goal: `Improve ${focus}`,
        days: 7
      });
      setNextWeekPlan(response.data.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to generate next-week plan right now.');
    } finally {
      setGenerating(false);
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
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" />
              Practical weekly planning
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-primary-500" />
              Weekly Review
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
              Replace guesswork with a weekly plan built from your actual mood and journal patterns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="btn-secondary inline-flex items-center gap-2"
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
        {summaryCards.map((card) => (
          <div key={card.label} className="glass-card p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.1fr,0.9fr] gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            This Week Signals
          </h2>
          <div className="space-y-3">
            {(report?.signals || []).map((signal, index) => (
              <div key={`${signal.title}-${index}`} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="font-semibold">{signal.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{signal.detail}</p>
                <p className="text-xs uppercase tracking-wide text-gray-500 mt-2">{toLabel(signal.direction)}</p>
              </div>
            ))}
            {(report?.signals || []).length === 0 && (
              <p className="text-sm text-gray-500">No strong signals detected yet. Add more mood or journal entries.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              Weekly Checklist
            </h2>
            <span className="text-sm text-gray-500">{completedCount}/{checklistItems.length} done</span>
          </div>

          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <div className="space-y-3 max-h-[24rem] overflow-y-auto pr-1">
            {checklistItems.map((item) => {
              const done = Boolean(checklist[item.id]);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleChecklist(item.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${
                    done
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`font-semibold ${done ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>{item.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                      <p className="text-xs text-gray-500 mt-2">{item.timing}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[0.95fr,1.05fr] gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <BookOpenText className="w-5 h-5 text-violet-500" />
            Recent Journal Highlights
          </h2>
          <div className="space-y-3">
            {journals.slice(0, 4).map((journal) => (
              <div key={journal._id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="font-semibold">{journal.title}</p>
                <p className="text-xs text-gray-500 mt-1">{shortDate(journal.createdAt)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {String(journal.content || '').slice(0, 140)}
                  {String(journal.content || '').length > 140 ? '...' : ''}
                </p>
              </div>
            ))}
            {journals.length === 0 && (
              <p className="text-sm text-gray-500">No journal highlights yet. Add journal entries to enrich weekly review.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-500" />
              Next Week Focus
            </h2>
            <button
              type="button"
              onClick={generateNextWeekPlan}
              disabled={generating}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Generate
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Current priority focus: <span className="font-semibold">{toLabel(report?.outlook?.priorityFocus || 'recovery')}</span>
          </p>

          {nextWeekPlan ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 p-4">
                <p className="font-semibold">{nextWeekPlan.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{nextWeekPlan.summary}</p>
              </div>
              {nextWeekPlan.days.slice(0, 5).map((day) => (
                <div key={day.day} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                  <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Day {day.day}</p>
                  <p className="text-sm font-semibold mt-1">{day.phase || day.focus}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{day.action}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-5 text-sm text-gray-500">
              Generate a 7-day plan from your current weekly signal profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyReview;
