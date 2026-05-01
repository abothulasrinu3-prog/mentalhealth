import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, RefreshCw, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const toLabel = (value = '') =>
  String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim();

const TriggerInsights = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const fetchInsights = async () => {
    try {
      const response = await axios.get(`${API_URL}/insights/report?days=30`);
      setReport(response.data.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load trigger insights right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const triggerMax = useMemo(
    () => Math.max(1, ...(report?.journalAnalysis?.topTriggers || []).map((item) => item.count || 0)),
    [report]
  );

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" />
              Real journal pattern mining
            </div>
            <h1 className="text-3xl font-bold">Trigger Insights</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
              This feature analyzes your actual journal and mood history to identify likely trigger clusters and protective patterns.
            </p>
          </div>

          <button type="button" onClick={fetchInsights} className="btn-secondary inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh analysis
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-900/10 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            Top Themes
          </h2>
          <div className="space-y-3">
            {(report?.journalAnalysis?.topThemes || []).map((theme) => (
              <div key={theme.label} className="rounded-xl bg-primary-50 dark:bg-primary-900/10 p-3 flex items-center justify-between">
                <span className="font-medium">{toLabel(theme.label)}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-900">{theme.count} hits</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Trigger Clusters
          </h2>
          <div className="space-y-3">
            {(report?.journalAnalysis?.topTriggers || []).map((trigger) => (
              <div key={trigger.label} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{toLabel(trigger.label)}</span>
                  <span className="text-xs text-gray-500">{trigger.count}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                    style={{ width: `${Math.round((trigger.count / triggerMax) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Protective Factors
          </h2>
          <div className="space-y-3">
            {(report?.journalAnalysis?.protectiveFactors || []).map((factor) => (
              <div key={factor.label} className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 p-3 flex items-center justify-between">
                <span className="font-medium">{toLabel(factor.label)}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-900">{factor.count} signals</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Priority Focus</h2>
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/80 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current focus based on your data</p>
            <p className="text-2xl font-bold mt-1">{toLabel(report?.outlook?.priorityFocus || 'recovery')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Tomorrow mood outlook: {toLabel(report?.outlook?.tomorrowMoodLabel || 'neutral')}
            </p>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Signal Highlights</h2>
          <div className="space-y-3">
            {(report?.signals || []).map((signal, index) => (
              <div key={`${signal.title}-${index}`} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="font-semibold">{signal.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{signal.detail}</p>
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">{toLabel(signal.direction)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriggerInsights;
