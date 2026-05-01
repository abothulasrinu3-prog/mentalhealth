import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Smile, Save, ArrowLeft, Loader2 } from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const moodOptions = [
  { label: 'very-happy', emoji: '😄', name: 'Very Happy', color: 'bg-emerald-500' },
  { label: 'happy', emoji: '🙂', name: 'Happy', color: 'bg-cyan-500' },
  { label: 'calm', emoji: '😌', name: 'Calm', color: 'bg-violet-500' },
  { label: 'neutral', emoji: '😐', name: 'Neutral', color: 'bg-gray-500' },
  { label: 'sad', emoji: '😔', name: 'Sad', color: 'bg-slate-500' },
  { label: 'anxious', emoji: '😰', name: 'Anxious', color: 'bg-amber-500' },
  { label: 'angry', emoji: '😠', name: 'Angry', color: 'bg-red-500' },
  { label: 'exhausted', emoji: '😫', name: 'Exhausted', color: 'bg-gray-600' }
];

const MoodTracker = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    moodLabel: '',
    moodScore: 5,
    intensity: 5,
    note: '',
    sleepHours: 7,
    stressLevel: 5,
    waterIntake: 6,
    exerciseMinutes: 0,
    meditationMinutes: 0,
    screenTime: 4,
    workHours: 8,
    socialInteraction: 5,
    appetiteLevel: 7,
    energyLevel: 6
  });

  const handleMoodSelect = (mood) => {
    const scoreMap = {
      'very-happy': 9, 'happy': 8, 'calm': 7, 'neutral': 5,
      'sad': 3, 'anxious': 3, 'angry': 2, 'exhausted': 2
    };
    setFormData({ 
      ...formData, 
      moodLabel: mood.label, 
      moodScore: scoreMap[mood.label] || 5 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.moodLabel) {
      alert('Please select a mood');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/mood/add`, formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Failed to save mood entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageExperience3D
        variant="mood"
        eyebrow="Mood check-in"
        title="Mood Tracker"
        description="A more inviting emotional check-in with animated mood energy, stress context, and daily note capture."
        metrics={['Mood score', 'Stress', 'Energy']}
      />
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Smile className="w-8 h-8 text-primary-500" />
            How are you feeling?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Track your mood and daily wellness metrics</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Selection */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Select your mood</h2>
          <div className="grid grid-cols-4 gap-3">
            {moodOptions.map((mood) => (
              <button
                key={mood.label}
                type="button"
                onClick={() => handleMoodSelect(mood)}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  formData.moodLabel === mood.label
                    ? `${mood.color} text-white shadow-lg scale-105`
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="text-3xl mb-1">{mood.emoji}</div>
                <div className="text-xs font-medium">{mood.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Slider */}
        <div className="glass-card p-6">
          <label className="block text-sm font-medium mb-3">
            Mood Intensity: <span className="text-primary-600 font-bold">{formData.intensity}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.intensity}
            onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Mild</span>
            <span>Intense</span>
          </div>
        </div>

        {/* Wellness Metrics */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Daily Wellness Metrics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: 'Sleep (hours)', key: 'sleepHours', min: 0, max: 24 },
              { label: 'Stress Level (1-10)', key: 'stressLevel', min: 1, max: 10 },
              { label: 'Water Intake (glasses)', key: 'waterIntake', min: 0, max: 20 },
              { label: 'Exercise (minutes)', key: 'exerciseMinutes', min: 0, max: 300 },
              { label: 'Meditation (minutes)', key: 'meditationMinutes', min: 0, max: 180 },
              { label: 'Screen Time (hours)', key: 'screenTime', min: 0, max: 24 },
              { label: 'Work/Study (hours)', key: 'workHours', min: 0, max: 24 },
              { label: 'Social Interaction (1-10)', key: 'socialInteraction', min: 1, max: 10 },
              { label: 'Appetite Level (1-10)', key: 'appetiteLevel', min: 1, max: 10 },
              { label: 'Energy Level (1-10)', key: 'energyLevel', min: 1, max: 10 }
            ].map((metric) => (
              <div key={metric.key}>
                <label className="block text-sm font-medium mb-2">
                  {metric.label}: <span className="text-primary-600">{formData[metric.key]}</span>
                </label>
                <input
                  type="range"
                  min={metric.min}
                  max={metric.max}
                  value={formData[metric.key]}
                  onChange={(e) => setFormData({ ...formData, [metric.key]: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="glass-card p-6">
          <label className="block text-sm font-medium mb-2">Notes (optional)</label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            rows={4}
            className="input-field resize-none"
            placeholder="What's on your mind today?"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.moodLabel}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Entry
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MoodTracker;
