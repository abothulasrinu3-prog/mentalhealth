import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, RefreshCw, ThumbsUp, ThumbsDown, Clock, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categoryColors = {
  'sleep': 'bg-indigo-100 text-indigo-700',
  'stress-reduction': 'bg-rose-100 text-rose-700',
  'physical-activity': 'bg-emerald-100 text-emerald-700',
  'mindfulness': 'bg-violet-100 text-violet-700',
  'hydration': 'bg-cyan-100 text-cyan-700',
  'journaling': 'bg-amber-100 text-amber-700',
  'social-connection': 'bg-pink-100 text-pink-700',
  'motivation': 'bg-orange-100 text-orange-700',
  'general': 'bg-gray-100 text-gray-700'
};

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/suggestions/list`);
      setSuggestions(response.data.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNew = async () => {
    setGenerating(true);
    try {
      await axios.post(`${API_URL}/suggestions/generate`);
      fetchSuggestions();
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setGenerating(false);
    }
  };

  const rateSuggestion = async (id, isHelpful) => {
    try {
      await axios.put(`${API_URL}/suggestions/${id}/rate`, { isHelpful });
      fetchSuggestions();
    } catch (error) {
      console.error('Error rating suggestion:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/suggestions/${id}/read`);
      fetchSuggestions();
    } catch (error) {
      console.error('Error marking as read:', error);
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
      <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-secondary-500" />
            AI Suggestions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized recommendations based on your wellness patterns
          </p>
        </div>
        <button
          onClick={generateNew}
          disabled={generating}
          className="btn-primary flex items-center gap-2 disabled:opacity-70"
        >
          {generating ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          Generate New
        </button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No suggestions yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start tracking your mood and wellness metrics to receive personalized AI suggestions.
            </p>
            <button onClick={generateNew} className="btn-primary">
              Generate Suggestions
            </button>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div 
              key={suggestion._id} 
              className={`glass-card p-6 transition-all duration-300 ${
                !suggestion.isRead ? 'border-l-4 border-l-primary-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  categoryColors[suggestion.category] || categoryColors.general
                }`}>
                  {suggestion.category.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(suggestion.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <p className="text-gray-800 dark:text-gray-200 mb-4 text-lg">
                {suggestion.suggestionText}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!suggestion.isRead && (
                    <button
                      onClick={() => markAsRead(suggestion._id)}
                      className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-200 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as read
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 mr-2">Was this helpful?</span>
                  <button
                    onClick={() => rateSuggestion(suggestion._id, true)}
                    className={`p-2 rounded-lg transition-colors ${
                      suggestion.isHelpful === true 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rateSuggestion(suggestion._id, false)}
                    className={`p-2 rounded-lg transition-colors ${
                      suggestion.isHelpful === false 
                        ? 'bg-red-100 text-red-700' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>About AI Suggestions:</strong> These recommendations are generated based on your tracked data patterns. 
          They are for general wellness guidance only and should not replace professional medical or psychological advice.
        </p>
      </div>
    </div>
  );
};

export default Suggestions;
