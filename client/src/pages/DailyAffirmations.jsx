import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Heart, Sparkles, RefreshCw, Share2, Bookmark, BookmarkCheck, ChevronRight, Clock, Star } from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const AFFIRMATION_REMINDER_TIME_KEY = 'affirmationReminderTime';
const AFFIRMATION_REMINDER_ENABLED_KEY = 'affirmationReminderEnabled';
const DEFAULT_REMINDER_TIME = '08:00';

const DailyAffirmations = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(7);
  const [todayViewed, setTodayViewed] = useState(false);
  const [showReminderEditor, setShowReminderEditor] = useState(false);
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem(AFFIRMATION_REMINDER_TIME_KEY) || DEFAULT_REMINDER_TIME);
  const [reminderEnabled, setReminderEnabled] = useState(() => localStorage.getItem(AFFIRMATION_REMINDER_ENABLED_KEY) === 'true');
  const [reminderMessage, setReminderMessage] = useState('');
  const reminderTimerRef = useRef(null);

  const affirmations = [
    { id: 1, text: "I am worthy of love and happiness.", category: "self-love" },
    { id: 2, text: "I choose to focus on what I can control.", category: "mindfulness" },
    { id: 3, text: "My feelings are valid and important.", category: "emotional" },
    { id: 4, text: "I am stronger than my anxiety.", category: "anxiety" },
    { id: 5, text: "Every day is a new beginning.", category: "growth" },
    { id: 6, text: "I deserve peace and tranquility.", category: "peace" },
    { id: 7, text: "My potential is limitless.", category: "growth" },
    { id: 8, text: "I am grateful for this moment.", category: "gratitude" },
    { id: 9, text: "I choose to let go of what no longer serves me.", category: "mindfulness" },
    { id: 10, text: "I am resilient and can handle anything.", category: "strength" },
    { id: 11, text: "My mental health matters.", category: "self-love" },
    { id: 12, text: "I am not defined by my past.", category: "growth" },
    { id: 13, text: "I choose self-compassion today.", category: "self-love" },
    { id: 14, text: "I trust the process of life.", category: "peace" },
    { id: 15, text: "I am allowed to take up space.", category: "self-love" },
    { id: 16, text: "My struggles do not define me.", category: "strength" },
    { id: 17, text: "I am doing the best I can.", category: "emotional" },
    { id: 18, text: "I choose progress over perfection.", category: "growth" },
    { id: 19, text: "I am worthy of good things.", category: "self-love" },
    { id: 20, text: "Today, I choose joy.", category: "gratitude" }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: Star },
    { id: 'self-love', label: 'Self Love', icon: Heart },
    { id: 'mindfulness', label: 'Mindfulness', icon: Sun },
    { id: 'growth', label: 'Growth', icon: Sparkles },
    { id: 'anxiety', label: 'Anxiety', icon: RefreshCw },
    { id: 'gratitude', label: 'Gratitude', icon: Star },
    { id: 'strength', label: 'Strength', icon: Heart },
    { id: 'peace', label: 'Peace', icon: Sun }
  ];

  useEffect(() => {
    getRandomAffirmation();
    const savedFavorites = JSON.parse(localStorage.getItem('affirmationFavorites') || '[]');
    setFavorites(savedFavorites);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (reminderTimerRef.current) {
        clearTimeout(reminderTimerRef.current);
      }
    };
  }, []);

  const getRandomAffirmation = () => {
    const filtered = category === 'all' ? affirmations : affirmations.filter(a => a.category === category);
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentAffirmation(random);
    setTodayViewed(true);
  };

  const toggleFavorite = (affirmation) => {
    let newFavorites;
    if (favorites.find(f => f.id === affirmation.id)) {
      newFavorites = favorites.filter(f => f.id !== affirmation.id);
    } else {
      newFavorites = [...favorites, affirmation];
    }
    setFavorites(newFavorites);
    localStorage.setItem('affirmationFavorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (id) => favorites.some(f => f.id === id);

  const shareAffirmation = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Daily Affirmation',
        text: currentAffirmation.text + ' - MindCare AI'
      });
    }
  };

  const formatReminderTime = (value) => {
    const [hoursRaw, minutesRaw] = String(value || DEFAULT_REMINDER_TIME).split(':');
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return DEFAULT_REMINDER_TIME;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const getNextReminderDelay = (timeValue) => {
    const [hoursRaw, minutesRaw] = String(timeValue || DEFAULT_REMINDER_TIME).split(':');
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);
    const now = new Date();
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next.getTime() - now.getTime();
  };

  const triggerReminderNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('MindCare Morning Reminder', {
        body: 'Start your day with one positive affirmation.',
        icon: '/favicon.ico'
      });
    }
  };

  const scheduleReminder = (timeValue) => {
    if (reminderTimerRef.current) {
      clearTimeout(reminderTimerRef.current);
    }

    const delay = getNextReminderDelay(timeValue);
    reminderTimerRef.current = setTimeout(() => {
      triggerReminderNotification();
      scheduleReminder(timeValue);
    }, delay);
  };

  const handleSaveReminder = async () => {
    localStorage.setItem(AFFIRMATION_REMINDER_TIME_KEY, reminderTime);

    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    setReminderEnabled(true);
    localStorage.setItem(AFFIRMATION_REMINDER_ENABLED_KEY, 'true');
    scheduleReminder(reminderTime);

    if ('Notification' in window && Notification.permission === 'granted') {
      setReminderMessage(`Reminder set for ${formatReminderTime(reminderTime)}.`);
    } else {
      setReminderMessage(`Reminder saved for ${formatReminderTime(reminderTime)}. Notifications are disabled in this browser.`);
    }
  };

  const handleDisableReminder = () => {
    setReminderEnabled(false);
    localStorage.setItem(AFFIRMATION_REMINDER_ENABLED_KEY, 'false');
    if (reminderTimerRef.current) {
      clearTimeout(reminderTimerRef.current);
    }
    setReminderMessage('Reminder disabled.');
  };

  useEffect(() => {
    if (reminderEnabled) {
      scheduleReminder(reminderTime);
    }
  }, [reminderEnabled, reminderTime]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <PageExperience3D
          variant="affirmations"
          eyebrow="Daily encouragement"
          title="Daily Affirmations"
          description="Animated affirmation cards and reminder energy to make daily reflection feel bright and personal."
          metrics={['Favorites', 'Reminders', `${streak} day streak`]}
        />
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Sun className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          </motion.div>
          <h1 className="text-3xl font-bold">Daily Affirmations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Start your day with positive thoughts
          </p>
        </div>

        {/* Streak Card */}
        <div className="glass-card p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-2xl"> streak</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{streak} days</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Keep going!</p>
              </div>
            </div>
            {todayViewed && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium">Today's done!</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                getRandomAffirmation();
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat.id
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Affirmation Card */}
        {currentAffirmation && (
          <motion.div
            className="glass-card p-8 text-center"
            key={currentAffirmation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-4">
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm capitalize">
                {currentAffirmation.category}
              </span>
            </div>
            
            <motion.p
              className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              "{currentAffirmation.text}"
            </motion.p>

            <div className="flex justify-center gap-4 mt-8">
              <motion.button
                onClick={() => toggleFavorite(currentAffirmation)}
                className={`p-3 rounded-full ${
                  isFavorite(currentAffirmation.id)
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isFavorite(currentAffirmation.id) ? (
                  <BookmarkCheck className="w-6 h-6" />
                ) : (
                  <Bookmark className="w-6 h-6" />
                )}
              </motion.button>
              
              <motion.button
                onClick={shareAffirmation}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Share2 className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                onClick={getRandomAffirmation}
                className="p-3 rounded-full bg-yellow-500 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RefreshCw className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Favorites Section */}
        <div className="glass-card p-6">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Saved Affirmations ({favorites.length})
            </h2>
            <ChevronRight className={`w-5 h-5 transition-transform ${showFavorites ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {showFavorites && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 space-y-3"
              >
                {favorites.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    No saved affirmations yet. Tap the bookmark to save!
                  </p>
                ) : (
                  favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
                    >
                      <p className="text-gray-700 dark:text-gray-300">{fav.text}</p>
                      <button
                        onClick={() => toggleFavorite(fav)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <BookmarkCheck className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Morning Reminder */}
        <div className="glass-card p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                Morning Reminder
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Set a daily reminder to start your morning with positivity
              </p>
            </div>
            <button
              onClick={() => setShowReminderEditor((value) => !value)}
              className="ml-auto btn-secondary text-sm"
            >
              {reminderEnabled ? 'Update Reminder' : 'Set Reminder'}
            </button>
          </div>

          <AnimatePresence>
            {showReminderEditor && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 rounded-xl bg-white/80 dark:bg-gray-900/30 p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <label className="text-sm text-gray-600 dark:text-gray-300">Reminder time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="input-field w-full sm:w-48"
                  />
                  <button onClick={handleSaveReminder} className="btn-primary text-sm px-4 py-2">
                    Save Reminder
                  </button>
                  {reminderEnabled && (
                    <button onClick={handleDisableReminder} className="btn-secondary text-sm px-4 py-2">
                      Disable
                    </button>
                  )}
                </div>

                {reminderEnabled && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Active daily reminder: {formatReminderTime(reminderTime)}
                  </p>
                )}
                {reminderMessage && (
                  <p className="text-sm text-purple-700 dark:text-purple-300">{reminderMessage}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </div>
  );
};

export default DailyAffirmations;
