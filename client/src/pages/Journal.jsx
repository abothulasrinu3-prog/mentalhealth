import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BookHeart, Plus, Search, Heart, Trash2, Edit2, X, Save, AlertTriangle, Shield, Mic, StopCircle } from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const moodTags = ['very-happy', 'happy', 'calm', 'neutral', 'sad', 'anxious', 'angry', 'exhausted', 'grateful', 'excited'];

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', moodTag: '', tags: '' });
  const [crisisAlert, setCrisisAlert] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setVoiceTranscript(prev => prev + finalTranscript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startRecording = () => {
    if (recognition) {
      setVoiceTranscript('');
      recognition.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const applyVoiceTranscript = () => {
    if (voiceTranscript.trim()) {
      setFormData(prev => ({
        ...prev,
        content: prev.content + (prev.content ? ' ' : '') + voiceTranscript.trim()
      }));
      setVoiceTranscript('');
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Crisis Detection AI
  const detectCrisis = (text) => {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die', 'hurt myself',
      'self-harm', 'cutting', 'overdose', 'suicidal', 'not worth living',
      'better off dead', 'end it all', 'can\'t go on', 'no point living',
      'hopeless', 'worthless', 'burden', 'give up'
    ];

    const lowerText = text.toLowerCase();
    const foundKeywords = crisisKeywords.filter(keyword => lowerText.includes(keyword));
    
    if (foundKeywords.length > 0) {
      setCrisisAlert({
        severity: 'high',
        keywords: foundKeywords,
        message: 'I notice some concerning words in your journal. Your wellbeing is important.',
        resources: [
          { name: 'Kiran Helpline', phone: '1800-599-0019' },
          { name: 'Emergency', phone: '112' }
        ]
      });
      return true;
    }
    return false;
  };

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/journal/list`);
      setEntries(response.data.data);
    } catch (error) {
      console.error('Error fetching journal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchEntries();
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/journal/search?q=${searchQuery}`);
      setEntries(response.data.data);
    } catch (error) {
      console.error('Error searching journal:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for crisis keywords before saving
    const fullText = `${formData.title} ${formData.content}`;
    const hasCrisis = detectCrisis(fullText);
    
    if (hasCrisis) {
      // Still save the entry, but show crisis alert
    }
    
    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const data = { ...formData, tags };

      if (editingId) {
        await axios.put(`${API_URL}/journal/${editingId}`, data);
      } else {
        await axios.post(`${API_URL}/journal/add`, data);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ title: '', content: '', moodTag: '', tags: '' });
      fetchEntries();
    } catch (error) {
      console.error('Error saving journal:', error);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      title: entry.title,
      content: entry.content,
      moodTag: entry.moodTag || '',
      tags: entry.tags?.join(', ') || ''
    });
    setEditingId(entry._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this journal entry?')) return;
    try {
      await axios.delete(`${API_URL}/journal/${id}`);
      fetchEntries();
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  const getMoodEmoji = (tag) => {
    const emojis = {
      'very-happy': '😄', 'happy': '🙂', 'calm': '😌', 'neutral': '😐',
      'sad': '😔', 'anxious': '😰', 'angry': '😠', 'exhausted': '😫',
      'grateful': '🙏', 'excited': '🤩'
    };
    return emojis[tag] || '';
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
      <PageExperience3D
        variant="journal"
        eyebrow="Reflective writing"
        title="Journal"
        description="A more expressive journaling space with animated depth, safety-aware reflection, search, and voice-friendly writing."
        metrics={['Reflections', 'Tags', 'Safety scan']}
      />
      {/* Crisis Alert */}
      <AnimatePresence>
        {crisisAlert && (
          <motion.div 
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-700 dark:text-red-300">Support Available</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {crisisAlert.message}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {crisisAlert.resources.map((resource, index) => (
                    <a 
                      key={index}
                      href={`tel:${resource.phone.replace(/\D/g, '')}`}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      {resource.name}: {resource.phone}
                    </a>
                  ))}
                  <button
                    onClick={() => setCrisisAlert(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookHeart className="w-8 h-8 text-violet-500" />
            Journal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Express yourself freely</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'New Entry'}
        </button>
      </div>

      {/* Search */}
      {!showForm && (
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search journal entries..."
              className="input-field pl-12"
            />
          </div>
          <button onClick={handleSearch} className="btn-secondary">
            Search
          </button>
        </div>
      )}

      {/* Entry Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 mb-6 animate-slide-up">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Entry title..."
            required
            className="input-field mb-4 text-lg font-semibold"
          />
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your thoughts here..."
            required
            rows={8}
            className="input-field mb-4 resize-none"
          />

          {/* Voice Journal Feature */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                Voice Journal
              </h3>
              {recognition ? (
                <motion.button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRecording ? (
                    <>
                      <StopCircle className="w-4 h-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Start Recording
                    </>
                  )}
                </motion.button>
              ) : (
                <span className="text-sm text-gray-500">Voice recording not supported</span>
              )}
            </div>

            {/* Recording Indicator */}
            <AnimatePresence>
              {isRecording && (
                <motion.div 
                  className="flex items-center gap-2 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-sm text-red-600 font-medium">Recording...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voice Transcript */}
            {(voiceTranscript || isRecording) && (
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 min-h-[60px]">
                  {voiceTranscript || 'Listening...'}
                </p>
                {voiceTranscript && (
                  <div className="flex gap-2 mt-2">
                    <motion.button
                      type="button"
                      onClick={applyVoiceTranscript}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Apply to Journal
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setVoiceTranscript('')}
                      className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click "Start Recording" and speak your thoughts. Your voice will be converted to text.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <select
              value={formData.moodTag}
              onChange={(e) => setFormData({ ...formData, moodTag: e.target.value })}
              className="input-field"
            >
              <option value="">Select mood (optional)</option>
              {moodTags.map(tag => (
                <option key={tag} value={tag}>{getMoodEmoji(tag)} {tag.replace('-', ' ')}</option>
              ))}
            </select>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Tags (comma separated)"
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            {editingId ? 'Update Entry' : 'Save Entry'}
          </button>
        </form>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BookHeart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No journal entries yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start journaling to track your thoughts and emotions over time.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Write your first entry
            </button>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry._id} className="glass-card p-6 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{entry.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {entry.moodTag && (
                    <span className="text-2xl" title={entry.moodTag}>
                      {getMoodEmoji(entry.moodTag)}
                    </span>
                  )}
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
                {entry.content.length > 300 ? entry.content.slice(0, 300) + '...' : entry.content}
              </p>
              {entry.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        </div>
      </div>
  );
};

export default Journal;
