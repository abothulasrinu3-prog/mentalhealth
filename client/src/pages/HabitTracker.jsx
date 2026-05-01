import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Calendar, Award, Plus, Check, X, Flame, Brain, Heart, Zap, Clock, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import PageExperience3D from '../components/PageExperience3D';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [newHabit, setNewHabit] = useState({
    name: '',
    category: 'wellness',
    frequency: 'daily',
    targetValue: 1,
    unit: '',
    reminderTime: '09:00',
    color: '#6366f1'
  });

  const categories = [
    { id: 'wellness', label: 'Wellness', icon: Heart, color: '#ef4444' },
    { id: 'productivity', label: 'Productivity', icon: Zap, color: '#f59e0b' },
    { id: 'fitness', label: 'Fitness', icon: Flame, color: '#10b981' },
    { id: 'mindfulness', label: 'Mindfulness', icon: Brain, color: '#8b5cf6' },
    { id: 'social', label: 'Social', icon: Star, color: '#ec4899' },
    { id: 'learning', label: 'Learning', icon: Award, color: '#3b82f6' }
  ];

  // Generate mock habits data
  useEffect(() => {
    generateMockHabits();
  }, []);

  const generateMockHabits = () => {
    const mockHabits = [
      {
        id: 1,
        name: 'Morning Meditation',
        category: 'mindfulness',
        frequency: 'daily',
        targetValue: 10,
        unit: 'minutes',
        reminderTime: '07:00',
        color: '#8b5cf6',
        streak: 12,
        completed: true,
        todayValue: 15,
        history: generateHabitHistory('daily', 30),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        name: 'Exercise',
        category: 'fitness',
        frequency: 'daily',
        targetValue: 30,
        unit: 'minutes',
        reminderTime: '18:00',
        color: '#10b981',
        streak: 5,
        completed: false,
        todayValue: 0,
        history: generateHabitHistory('daily', 30),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        name: 'Read Books',
        category: 'learning',
        frequency: 'daily',
        targetValue: 20,
        unit: 'pages',
        reminderTime: '21:00',
        color: '#3b82f6',
        streak: 8,
        completed: true,
        todayValue: 25,
        history: generateHabitHistory('daily', 30),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        name: 'Gratitude Journal',
        category: 'wellness',
        frequency: 'daily',
        targetValue: 3,
        unit: 'items',
        reminderTime: '20:00',
        color: '#ef4444',
        streak: 15,
        completed: true,
        todayValue: 3,
        history: generateHabitHistory('daily', 30),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        id: 5,
        name: 'Drink Water',
        category: 'wellness',
        frequency: 'daily',
        targetValue: 8,
        unit: 'glasses',
        reminderTime: '09:00',
        color: '#06b6d4',
        streak: 3,
        completed: false,
        todayValue: 5,
        history: generateHabitHistory('daily', 30),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: 6,
        name: 'Weekly Yoga',
        category: 'fitness',
        frequency: 'weekly',
        targetValue: 1,
        unit: 'session',
        reminderTime: 'Saturday 09:00',
        color: '#10b981',
        streak: 4,
        completed: false,
        todayValue: 0,
        history: generateHabitHistory('weekly', 12),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];
    setHabits(mockHabits);
    setLoading(false);
  };

  const generateHabitHistory = (frequency, days) => {
    const history = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      if (frequency === 'weekly' && i % 7 !== 0) continue;
      
      history.push({
        date: date.toISOString().split('T')[0],
        completed: Math.random() > 0.3,
        value: Math.floor(Math.random() * 20) + 5
      });
    }
    return history;
  };

  const handleAddHabit = () => {
    const habit = {
      ...newHabit,
      id: habits.length + 1,
      streak: 0,
      completed: false,
      todayValue: 0,
      history: [],
      createdAt: new Date()
    };
    setHabits([...habits, habit]);
    setShowAddForm(false);
    setNewHabit({
      name: '',
      category: 'wellness',
      frequency: 'daily',
      targetValue: 1,
      unit: '',
      reminderTime: '09:00',
      color: '#6366f1'
    });
  };

  const toggleHabitCompletion = (habitId) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompleted = !habit.completed;
        const newStreak = newCompleted ? habit.streak + 1 : 0;
        const newHistory = [
          {
            date: new Date().toISOString().split('T')[0],
            completed: newCompleted,
            value: newCompleted ? habit.targetValue : habit.todayValue
          },
          ...habit.history
        ];
        
        return {
          ...habit,
          completed: newCompleted,
          streak: newStreak,
          todayValue: newCompleted ? habit.targetValue : 0,
          history: newHistory.slice(0, 30)
        };
      }
      return habit;
    }));
  };

  const updateHabitValue = (habitId, value) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const completed = parseInt(value) >= habit.targetValue;
        const newStreak = completed && !habit.completed ? habit.streak + 1 : 
                          !completed ? 0 : habit.streak;
        
        return {
          ...habit,
          todayValue: parseInt(value),
          completed,
          streak: newStreak
        };
      }
      return habit;
    }));
  };

  const deleteHabit = (habitId) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };

  const getCompletionRate = () => {
    if (habits.length === 0) return 0;
    const completed = habits.filter(habit => habit.completed).length;
    return Math.round((completed / habits.length) * 100);
  };

  const getTotalStreak = () => {
    return habits.reduce((sum, habit) => sum + habit.streak, 0);
  };

  const getChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const completed = habits.filter(habit => 
        habit.history.some(h => h.date === dateStr && h.completed)
      ).length;
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        total: habits.length
      });
    }
    return last7Days;
  };

  const getCategoryStats = () => {
    return categories.map(category => {
      const categoryHabits = habits.filter(h => h.category === category.id);
      const completed = categoryHabits.filter(h => h.completed).length;
      return {
        name: category.label,
        completed,
        total: categoryHabits.length,
        color: category.color
      };
    }).filter(stat => stat.total > 0);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto space-y-8">
        <PageExperience3D
          variant="habit"
          eyebrow="Routine builder"
          title="Habit Tracker"
          description="Animated habit momentum with 3D progress energy, streak focus, and weekly consistency views."
          metrics={['Streaks', 'Momentum', 'Completion']}
        />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="w-8 h-8 text-green-500" />
              Habit Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Build positive habits and track your progress daily
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Add Habit
            </motion.button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Today's Progress</span>
            </div>
            <div className="text-2xl font-bold">{getCompletionRate()}%</div>
            <div className="text-xs text-gray-500">
              {habits.filter(h => h.completed).length}/{habits.length} completed
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Streak</span>
            </div>
            <div className="text-2xl font-bold">{getTotalStreak()}</div>
            <div className="text-xs text-gray-500">days across all habits</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Habits</span>
            </div>
            <div className="text-2xl font-bold">{habits.length}</div>
            <div className="text-xs text-gray-500">being tracked</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Best Streak</span>
            </div>
            <div className="text-2xl font-bold">
              {habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}
            </div>
            <div className="text-xs text-gray-500">longest this month</div>
          </div>
        </div>

        {/* Add Habit Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Habit</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Habit Name</label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                    placeholder="e.g., Morning Meditation"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                    className="input-field"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                    className="input-field"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newHabit.targetValue}
                      onChange={(e) => setNewHabit({...newHabit, targetValue: parseInt(e.target.value)})}
                      placeholder="10"
                      className="input-field flex-1"
                    />
                    <input
                      type="text"
                      value={newHabit.unit}
                      onChange={(e) => setNewHabit({...newHabit, unit: e.target.value})}
                      placeholder="minutes"
                      className="input-field w-24"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reminder Time</label>
                  <input
                    type="time"
                    value={newHabit.reminderTime}
                    onChange={(e) => setNewHabit({...newHabit, reminderTime: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <input
                    type="color"
                    value={newHabit.color}
                    onChange={(e) => setNewHabit({...newHabit, color: e.target.value})}
                    className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <motion.button
                  onClick={handleAddHabit}
                  disabled={!newHabit.name.trim()}
                  className="btn-primary disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Habit
                </motion.button>
                <motion.button
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getCategoryStats()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Habits List */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Your Habits</h3>
          <div className="space-y-4">
            {habits.map((habit, index) => {
              const category = categories.find(c => c.id === habit.category);
              const CategoryIcon = category?.icon || Target;
              
              return (
                <motion.div
                  key={habit.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: habit.color + '20' }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <CategoryIcon className="w-6 h-6" style={{ color: habit.color }} />
                      </motion.div>
                      <div>
                        <h4 className="font-semibold">{habit.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {habit.targetValue} {habit.unit} • {habit.frequency}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-orange-600">
                            {habit.streak} day streak
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {habit.unit && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={habit.todayValue}
                            onChange={(e) => updateHabitValue(habit.id, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center"
                            min="0"
                          />
                          <span className="text-sm text-gray-600">/ {habit.targetValue}</span>
                        </div>
                      )}
                      
                      <motion.button
                        onClick={() => toggleHabitCompletion(habit.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          habit.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {habit.completed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </motion.button>
                      
                      <motion.button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: habit.color,
                          width: `${Math.min((habit.todayValue / habit.targetValue) * 100, 100)}%`
                        }}
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min((habit.todayValue / habit.targetValue) * 100, 100)}%`
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Motivational Tips */}
        <div className="glass-card p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Habit Building Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700 dark:text-green-300">Start Small</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Begin with habits that take 2 minutes or less</li>
                <li>• Focus on consistency over intensity</li>
                <li>• Stack new habits onto existing ones</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Stay Motivated</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Track your progress visually</li>
                <li>• Celebrate small wins</li>
                <li>• Don't break the chain - miss once, never twice</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default HabitTracker;
