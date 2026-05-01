import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Star, Plus, Search, Edit2, Trash2, X, Save, Cloud, CloudMoon, Brain, Heart, Tag } from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const DreamJournal = () => {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    lucid: false,
    recurring: false,
    tags: ''
  });

  const dreamMoods = [
    { id: 'peaceful', label: 'Peaceful', icon: Moon, color: 'text-blue-500' },
    { id: 'happy', label: 'Happy', icon: Star, color: 'text-yellow-500' },
    { id: 'neutral', label: 'Neutral', icon: Cloud, color: 'text-gray-500' },
    { id: 'anxious', label: 'Anxious', icon: CloudMoon, color: 'text-purple-500' },
    { id: 'nightmare', label: 'Nightmare', icon: Moon, color: 'text-red-500' }
  ];

  const dreamThemeDictionary = {
    freedom: ['fly', 'flying', 'sky', 'mountain', 'mountains', 'open', 'free'],
    chaseFear: ['chase', 'running', 'run', 'fear', 'dark', 'forest', 'escape'],
    connection: ['friend', 'friends', 'family', 'party', 'together', 'reunion'],
    confusion: ['maze', 'lost', 'stuck', 'corridor', 'hallway', 'searching'],
    transformation: ['door', 'garden', 'sunset', 'light', 'path', 'change']
  };

  useEffect(() => {
    generateMockDreams();
  }, []);

  useEffect(() => {
    setAnalysis(null);
  }, [searchQuery, selectedMood, dreams.length]);

  const generateMockDreams = () => {
    const mockDreams = [
      {
        id: 1,
        title: 'Flying Over Mountains',
        content: 'I was flying over beautiful snow-capped mountains. The air was crisp and I felt completely free. I could see tiny villages below and the sun was setting, painting everything in golden light.',
        mood: 'peaceful',
        lucid: true,
        recurring: false,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: ['flying', 'freedom', 'nature']
      },
      {
        id: 2,
        title: 'Lost in a Maze',
        content: 'I was wandering through an endless maze of corridors. Every turn led to another identical hallway. I felt anxious and couldn\'t find my way out. Eventually, I found a door that led to a beautiful garden.',
        mood: 'anxious',
        lucid: false,
        recurring: true,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        tags: ['maze', 'anxiety', 'escape']
      },
      {
        id: 3,
        title: 'Reunion with Old Friends',
        content: 'I met friends from childhood at a beach party. We were all young again, playing in the waves. Everyone was happy and laughing. It felt so real and warm.',
        mood: 'happy',
        lucid: false,
        recurring: false,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tags: ['friends', 'nostalgia', 'beach']
      },
      {
        id: 4,
        title: 'Chased Through Dark Forest',
        content: 'Something was chasing me through a dark forest. I couldn\'t see what it was, but I could hear its footsteps. I kept running but felt like I was moving in slow motion.',
        mood: 'nightmare',
        lucid: false,
        recurring: true,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        tags: ['chase', 'fear', 'forest']
      }
    ];
    setDreams(mockDreams);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dream = {
      id: dreams.length + 1,
      ...formData,
      date: new Date(),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    setDreams([dream, ...dreams]);
    setShowForm(false);
    setFormData({
      title: '',
      content: '',
      mood: 'neutral',
      lucid: false,
      recurring: false,
      tags: ''
    });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this dream entry?')) {
      setDreams(dreams.filter(d => d.id !== id));
    }
  };

  const getMoodIcon = (mood) => {
    const found = dreamMoods.find(m => m.id === mood);
    if (!found) return <Moon className="w-5 h-5 text-gray-500" />;
    const Icon = found.icon;
    return <Icon className={`w-5 h-5 ${found.color}`} />;
  };

  const getMoodColor = (mood) => {
    const colors = {
      peaceful: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
      happy: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
      neutral: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
      anxious: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
      nightmare: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
    };
    return colors[mood] || colors.neutral;
  };

  const filteredDreams = dreams.filter(dream => {
    const matchesSearch = dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dream.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = selectedMood === 'all' || dream.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  const toTitle = (value = '') =>
    String(value)
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, (character) => character.toUpperCase())
      .trim();

  const buildAnalysis = (entries = []) => {
    if (!entries.length) return null;

    const moodCount = entries.reduce((acc, dream) => {
      acc[dream.mood] = (acc[dream.mood] || 0) + 1;
      return acc;
    }, {});

    const dominantMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
    const dominantMoodLabel = dreamMoods.find((mood) => mood.id === dominantMood)?.label || 'Neutral';

    const recurringCount = entries.filter((dream) => dream.recurring).length;
    const lucidCount = entries.filter((dream) => dream.lucid).length;
    const recurringRate = Math.round((recurringCount / entries.length) * 100);
    const lucidRate = Math.round((lucidCount / entries.length) * 100);

    const tagCounter = new Map();
    entries.forEach((dream) => {
      (dream.tags || []).forEach((tag) => {
        const normalized = String(tag).toLowerCase().trim();
        if (!normalized) return;
        tagCounter.set(normalized, (tagCounter.get(normalized) || 0) + 1);
      });
    });

    const topTags = [...tagCounter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ label: tag, count }));

    const themeScores = Object.entries(dreamThemeDictionary).map(([theme, terms]) => {
      const score = entries.reduce((total, dream) => {
        const text = `${dream.title} ${dream.content} ${(dream.tags || []).join(' ')}`.toLowerCase();
        const hits = terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);
        return total + hits;
      }, 0);
      return { label: theme, score };
    });

    const topThemes = themeScores
      .filter((theme) => theme.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const recommendations = [];
    if (recurringRate >= 40) {
      recommendations.push('Recurring dreams are high. Add a short daytime note about what feels unresolved before sleep.');
    }
    if (dominantMood === 'anxious' || dominantMood === 'nightmare') {
      recommendations.push('Dream mood leans heavy. Try a calmer pre-sleep routine with lower stimulation for 45 minutes.');
    }
    if (lucidRate >= 30) {
      recommendations.push('Lucid recall is strong. Keep your dream journal beside bed and write immediately after waking.');
    }
    if (topThemes.some((theme) => theme.label === 'confusion')) {
      recommendations.push('Confusion-style symbols appear often. Capture one clear next-day intention to reduce mental overload.');
    }
    if (!recommendations.length) {
      recommendations.push('Your dream patterns look balanced. Keep consistent logging to improve long-term insight quality.');
    }

    return {
      totalAnalyzed: entries.length,
      recurringRate,
      lucidRate,
      dominantMoodLabel,
      topThemes,
      topTags,
      recommendations: recommendations.slice(0, 3)
    };
  };

  const handleAnalyze = () => {
    if (!filteredDreams.length || isAnalyzing) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysis(buildAnalysis(filteredDreams));
      setIsAnalyzing(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <PageExperience3D
          variant="dream"
          eyebrow="Dream pattern studio"
          title="Dream Journal"
          description="A deeper visual journal for dreams, symbols, moods, lucid patterns, and recurring themes."
          metrics={['Lucid notes', 'Theme scan', 'Mood filter']}
        />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Moon className="w-8 h-8 text-purple-500" />
              Dream Journal
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Explore your subconscious through your dreams
            </p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Record Dream
          </motion.button>
        </div>

        {/* Dream Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{dreams.length}</div>
            <div className="text-sm text-gray-600">Total Dreams</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{dreams.filter(d => d.lucid).length}</div>
            <div className="text-sm text-gray-600">Lucid Dreams</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{dreams.filter(d => d.recurring).length}</div>
            <div className="text-sm text-gray-600">Recurring</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{dreams.filter(d => d.mood === 'peaceful' || d.mood === 'happy').length}</div>
            <div className="text-sm text-gray-600">Positive</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search dreams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="input-field"
          >
            <option value="all">All Moods</option>
            {dreamMoods.map(mood => (
              <option key={mood.id} value={mood.id}>{mood.label}</option>
            ))}
          </select>
        </div>

        {/* Dream Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Record Your Dream</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Dream title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="input-field text-lg font-semibold"
                />

                <textarea
                  placeholder="Describe your dream in detail..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={6}
                  className="input-field resize-none"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Dream Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {dreamMoods.map(mood => (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, mood: mood.id })}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                          formData.mood === mood.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {getMoodIcon(mood.id)}
                        {mood.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.lucid}
                      onChange={(e) => setFormData({ ...formData, lucid: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Lucid Dream</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recurring}
                      onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Recurring Dream</span>
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input-field"
                />

                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Dream
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dream Entries */}
        <div className="space-y-4">
          {filteredDreams.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Moon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No dreams recorded</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start capturing your dreams to understand your subconscious
              </p>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                Record your first dream
              </button>
            </div>
          ) : (
            filteredDreams.map((dream, index) => (
              <motion.div
                key={dream.id}
                className={`glass-card p-6 border-l-4 ${getMoodColor(dream.mood)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold">{dream.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500">
                        {dream.date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {getMoodIcon(dream.mood)}
                      {dream.lucid && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                          Lucid
                        </span>
                      )}
                      {dream.recurring && (
                        <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">
                          Recurring
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-500">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dream.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{dream.content}</p>
                {dream.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dream.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Dream Analysis */}
        <div className="glass-card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-4">
            <Brain className="w-10 h-10 text-purple-500" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                Dream Pattern Analysis
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                AI-powered insights into your recurring dream themes
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!filteredDreams.length || isAnalyzing}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {analysis && (
            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/80 dark:bg-gray-900/30 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Analyzed Dreams</p>
                <p className="text-2xl font-bold mt-1">{analysis.totalAnalyzed}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  Dominant mood: <span className="font-semibold">{analysis.dominantMoodLabel}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Recurring rate: <span className="font-semibold">{analysis.recurringRate}%</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Lucid rate: <span className="font-semibold">{analysis.lucidRate}%</span>
                </p>
              </div>

              <div className="rounded-2xl bg-white/80 dark:bg-gray-900/30 p-4">
                <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-purple-500" />
                  Top Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.topTags.length > 0 ? analysis.topTags.map((tag) => (
                    <span key={tag.label} className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      #{tag.label} ({tag.count})
                    </span>
                  )) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">No tag data yet.</span>
                  )}
                </div>
                <p className="text-sm font-semibold mt-4 mb-2">Top Themes</p>
                <div className="space-y-1">
                  {analysis.topThemes.length > 0 ? analysis.topThemes.map((theme) => (
                    <div key={theme.label} className="text-sm text-gray-700 dark:text-gray-200">
                      {toTitle(theme.label)} ({theme.score})
                    </div>
                  )) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">No strong recurring themes detected.</span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 rounded-2xl bg-white/80 dark:bg-gray-900/30 p-4">
                <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Suggested Reflection Actions
                </p>
                <div className="space-y-2">
                  {analysis.recommendations.map((item, index) => (
                    <p key={`${item}-${index}`} className="text-sm text-gray-700 dark:text-gray-200">
                      {index + 1}. {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default DreamJournal;
