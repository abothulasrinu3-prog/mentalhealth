import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Download,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingUp,
  Wand2
} from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const severityTone = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
};

const directionTone = {
  improving: 'text-emerald-600 dark:text-emerald-300',
  declining: 'text-red-600 dark:text-red-300',
  stable: 'text-gray-500 dark:text-gray-300'
};

const pretty = (value = '') =>
  String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const formatDelta = (delta = 0, unit = '') => `${delta > 0 ? '+' : ''}${delta}${unit}`;

const CareIntelligence = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [outcomes, setOutcomes] = useState(null);
  const [brief, setBrief] = useState(null);
  const [thought, setThought] = useState('');
  const [reframing, setReframing] = useState(false);
  const [reframeResult, setReframeResult] = useState(null);

  const loadData = async (withRefresh = false) => {
    if (withRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [alertsResponse, outcomesResponse, briefResponse] = await Promise.all([
        axios.get(`${API_URL}/insights/alerts?days=${days}`),
        axios.get(`${API_URL}/insights/outcomes?days=${days}`),
        axios.get(`${API_URL}/insights/therapist-brief?days=${days}`)
      ]);

      setAlerts(alertsResponse.data?.data?.alerts || []);
      setOutcomes(outcomesResponse.data?.data || null);
      setBrief(briefResponse.data?.data || null);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load Care Intelligence right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [days]);

  const criticalAlerts = useMemo(() => alerts.filter((item) => item.severity === 'high').length, [alerts]);

  const downloadBrief = () => {
    if (!brief?.exportText) return;

    const content = `${brief.exportText}\n\nConfidentiality note: Generated for care collaboration only.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `mindcare-therapist-brief-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleReframe = async () => {
    const trimmed = String(thought || '').trim();
    if (!trimmed) return;

    setReframing(true);
    try {
      const response = await axios.post(`${API_URL}/genai/reframe`, { thought: trimmed });
      setReframeResult(response.data?.data || null);
      setError('');
    } catch (requestError) {
      setReframeResult(null);
      setError(requestError.response?.data?.message || 'Unable to generate a thought reframe right now.');
    } finally {
      setReframing(false);
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
      <PageExperience3D
        variant="care"
        eyebrow="Clinical-style intelligence"
        title="Care Intelligence"
        description="A 3D care cockpit for risk alerts, therapist briefs, measurable outcomes, and reframing support."
        metrics={['Risk alerts', 'Care brief', 'CBT reframe']}
      />
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" />
              Advanced care support
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary-500" />
              Care Intelligence Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
              Real-time risk alerts, measurable outcomes, therapist-ready summary export, and CBT-style thought reframing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="input-field min-w-[9rem]"
            >
              <option value={14}>Last 14 days</option>
              <option value={21}>Last 21 days</option>
              <option value={30}>Last 30 days</option>
              <option value={45}>Last 45 days</option>
            </select>
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-900/10 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Alerts</p>
          <p className="text-3xl font-bold mt-1">{alerts.length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">High Priority</p>
          <p className="text-3xl font-bold mt-1 text-red-600">{criticalAlerts}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Momentum Score</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">{outcomes?.momentumScore ?? 0}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Talking Points</p>
          <p className="text-3xl font-bold mt-1 text-primary-600">{brief?.suggestedTalkingPoints?.length || 0}</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr,1fr] gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Risk Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{alert.title}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityTone[alert.severity] || severityTone.low}`}>
                    {pretty(alert.severity)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{alert.detail}</p>
                <p className="text-sm mt-2 text-primary-700 dark:text-primary-300">
                  Next step: {alert.action}
                </p>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-5 text-sm text-gray-500">
                No major alerts detected for this window.
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Measurable Outcomes
          </h2>

          <div className="space-y-3">
            {(outcomes?.outcomes || []).map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.label}</p>
                  <p className={`text-sm font-semibold ${directionTone[item.direction] || directionTone.stable}`}>
                    {pretty(item.direction)}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800/70 p-2">
                    <p className="text-gray-500">Baseline</p>
                    <p className="font-semibold">{item.baseline}{item.unit}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800/70 p-2">
                    <p className="text-gray-500">Current</p>
                    <p className="font-semibold">{item.current}{item.unit}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800/70 p-2">
                    <p className="text-gray-500">Delta</p>
                    <p className="font-semibold">{formatDelta(item.delta, item.unit)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Wins</p>
              <p className="text-sm mt-1">{(outcomes?.wins || []).join(', ') || 'No strong gains yet'}</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wide">Watchouts</p>
              <p className="text-sm mt-1">{(outcomes?.watchouts || []).join(', ') || 'No immediate watchouts'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr,1fr] gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Download className="w-5 h-5 text-primary-500" />
              Therapist Brief
            </h2>
            <button
              type="button"
              onClick={downloadBrief}
              disabled={!brief?.exportText}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download TXT
            </button>
          </div>

          <div className="space-y-3">
            {(brief?.suggestedTalkingPoints || []).map((point, index) => (
              <div key={`brief-point-${index}`} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm">
                {point}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/70 p-3">
              <p className="text-gray-500">Top Themes</p>
              <p className="font-semibold mt-1">{(brief?.themes?.topThemes || []).join(', ') || 'n/a'}</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/70 p-3">
              <p className="text-gray-500">Top Triggers</p>
              <p className="font-semibold mt-1">{(brief?.themes?.topTriggers || []).join(', ') || 'n/a'}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-violet-500" />
            CBT Thought Reframer
          </h2>

          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Stress thought</label>
          <textarea
            value={thought}
            onChange={(event) => setThought(event.target.value)}
            rows={4}
            className="w-full input-field resize-none"
            placeholder="Example: I always fail and nothing gets better."
          />
          <button
            type="button"
            onClick={handleReframe}
            disabled={reframing || !String(thought || '').trim()}
            className="btn-primary mt-3 inline-flex items-center gap-2 disabled:opacity-50"
          >
            {reframing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Reframe Thought
          </button>

          {reframeResult && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-violet-50 dark:bg-violet-900/10 p-3">
                <p className="text-xs uppercase tracking-wide text-violet-700 dark:text-violet-300 mb-1">Balanced Thought</p>
                <p className="text-sm">{reframeResult.balancedThought}</p>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/70 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Detected Patterns</p>
                <div className="flex flex-wrap gap-2">
                  {(reframeResult.detectedPatterns || []).map((pattern) => (
                    <span key={pattern.id} className="px-2 py-1 rounded-full text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      {pattern.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 p-3">
                <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-2">Micro Actions</p>
                <div className="space-y-2">
                  {(reframeResult.microActions || []).map((action, index) => (
                    <div key={`micro-${index}`} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareIntelligence;
