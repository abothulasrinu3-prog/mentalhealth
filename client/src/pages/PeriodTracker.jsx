import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Droplets, Heart, TrendingUp, AlertCircle, Plus, Clock, Moon, Sun, Flower, Brain, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import PageExperience3D from '../components/PageExperience3D';

const PeriodTracker = () => {
  const [cycles, setCycles] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedView, setSelectedView] = useState('calendar');
  const [predictions, setPredictions] = useState(null);
  
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    flow: 'medium',
    symptoms: [],
    mood: 3,
    notes: ''
  });

  const flowOptions = [
    { value: 'none', label: 'No Flow', color: 'bg-gray-200' },
    { value: 'light', label: 'Light', color: 'bg-pink-200' },
    { value: 'medium', label: 'Medium', color: 'bg-pink-400' },
    { value: 'heavy', label: 'Heavy', color: 'bg-pink-600' }
  ];

  const symptomsOptions = [
    'Cramps', 'Bloating', 'Headache', 'Breast Tenderness', 'Fatigue', 
    'Acne', 'Back Pain', 'Nausea', 'Food Cravings', 'Mood Swings',
    'Anxiety', 'Depression', 'Insomnia', 'Appetite Changes'
  ];

  // Generate mock cycle data
  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    const mockCycles = [];
    const today = new Date();
    
    // Generate last 6 cycles (newest first)
    for (let i = 0; i < 6; i++) {
      const cycleStart = new Date(today);
      cycleStart.setDate(today.getDate() - (i * 28 + Math.floor(Math.random() * 7)));
      
      const cycleLength = 26 + Math.floor(Math.random() * 6); // 26-32 days
      const periodLength = 4 + Math.floor(Math.random() * 3); // 4-6 days
      
      const cycle = {
        id: i + 1,
        startDate: cycleStart.toISOString().split('T')[0],
        endDate: new Date(cycleStart.getTime() + (cycleLength - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodLength,
        cycleLength,
        entries: generatePeriodEntries(cycleStart, periodLength),
        symptoms: generateSymptoms(),
        averageMood: 3 + Math.random() * 2,
        notes: i === 0 ? 'Current cycle - tracking symptoms closely' : ''
      };
      
      mockCycles.push(cycle);
    }
    
    setCycles(mockCycles);
    setCurrentCycle(mockCycles[0]);
    generatePredictions(mockCycles);
    setLoading(false);
  };

  const generatePeriodEntries = (startDate, periodLength) => {
    const entries = [];
    for (let i = 0; i < periodLength; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      let flow = 'heavy';
      if (i === 0 || i === periodLength - 1) flow = 'light';
      if (i >= 2 && i <= periodLength - 3) flow = 'heavy';
      
      entries.push({
        date: date.toISOString().split('T')[0],
        flow,
        symptoms: symptomsOptions.slice(0, 2 + Math.floor(Math.random() * 3)),
        mood: 2 + Math.random() * 3,
        notes: ''
      });
    }
    return entries;
  };

  const generateSymptoms = () => {
    return symptomsOptions.slice(0, 3 + Math.floor(Math.random() * 4));
  };

  const generatePredictions = (cycles) => {
    if (cycles.length < 2) return;
    
    const avgCycleLength = Math.round(cycles.reduce((sum, cycle) => sum + cycle.cycleLength, 0) / cycles.length);
    const avgPeriodLength = Math.round(cycles.reduce((sum, cycle) => sum + cycle.periodLength, 0) / cycles.length);
    
    const lastCycle = cycles[0];
    const nextPeriodStart = new Date(lastCycle.startDate);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + avgCycleLength);
    
    const ovulationDay = new Date(lastCycle.startDate);
    ovulationDay.setDate(ovulationDay.getDate() + Math.floor(avgCycleLength / 2));
    
    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(fertileStart.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    setPredictions({
      nextPeriod: nextPeriodStart,
      ovulation: ovulationDay,
      fertileWindow: { start: fertileStart, end: fertileEnd },
      avgCycleLength,
      avgPeriodLength,
      phase: getCurrentPhase(lastCycle, avgCycleLength)
    });
  };

  const getCurrentPhase = (lastCycle, avgCycleLength) => {
    const today = new Date();
    const cycleStart = new Date(lastCycle.startDate);
    const daysSinceStart = Math.floor((today - cycleStart) / (24 * 60 * 60 * 1000));
    
    if (daysSinceStart < 0) return 'pre-menstrual';
    if (daysSinceStart <= lastCycle.periodLength) return 'menstrual';
    if (daysSinceStart <= Math.floor(avgCycleLength / 2) - 3) return 'follicular';
    if (daysSinceStart <= Math.floor(avgCycleLength / 2) + 1) return 'ovulation';
    if (daysSinceStart <= avgCycleLength - 7) return 'luteal';
    return 'pre-menstrual';
  };

  const handleAddEntry = () => {
    if (currentCycle) {
      const updatedEntries = [...currentCycle.entries, {
        ...newEntry,
        date: newEntry.date,
        symptoms: Array.isArray(newEntry.symptoms) ? newEntry.symptoms : [newEntry.symptoms]
      }];
      
      const updatedCycle = {
        ...currentCycle,
        entries: updatedEntries
      };
      
      setCycles(cycles.map(cycle => 
        cycle.id === currentCycle.id ? updatedCycle : cycle
      ));
      setCurrentCycle(updatedCycle);
    }
    
    setShowAddForm(false);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      flow: 'medium',
      symptoms: [],
      mood: 3,
      notes: ''
    });
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'menstrual': 'bg-pink-500',
      'follicular': 'bg-green-500',
      'ovulation': 'bg-blue-500',
      'luteal': 'bg-purple-500',
      'pre-menstrual': 'bg-orange-500'
    };
    return colors[phase] || 'bg-gray-500';
  };

  const getPhaseInfo = (phase) => {
    const info = {
      'menstrual': { name: 'Menstrual', icon: Droplets, description: 'Period phase - energy may be lower' },
      'follicular': { name: 'Follicular', icon: Flower, description: 'Rising energy - good for new projects' },
      'ovulation': { name: 'Ovulation', icon: Sun, description: 'Peak energy - high confidence' },
      'luteal': { name: 'Luteal', icon: Moon, description: 'Winding down - focus on self-care' },
      'pre-menstrual': { name: 'Pre-menstrual', icon: AlertCircle, description: 'Prepare for period - manage symptoms' }
    };
    return info[phase] || info['follicular'];
  };

  const getChartData = () => {
    if (!currentCycle) return [];
    
    return currentCycle.entries.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood,
      symptoms: entry.symptoms.length
    }));
  };

  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if this date has an entry
      const entry = currentCycle?.entries.find(e => e.date === dateStr);
      
      days.push({
        date: i,
        fullDate: dateStr,
        entry,
        isToday: i === today.getDate(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return days;
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
    );
  }

  const currentPhaseInfo = getPhaseInfo(predictions?.phase || 'follicular');
  const PhaseIcon = currentPhaseInfo.icon;

  return (
      <div className="max-w-7xl mx-auto space-y-8">
        <PageExperience3D
          variant="period"
          eyebrow="Cycle insights"
          title="Period Tracker"
          description="A softer cycle dashboard with 3D rhythm cues, symptoms, predictions, and wellness recommendations."
          metrics={['Cycle day', 'Symptoms', 'Forecast']}
        />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="w-8 h-8 text-pink-500" />
              Period Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your cycle and understand your body's patterns
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
              Log Entry
            </motion.button>
          </div>
        </div>

        {/* Current Phase Card */}
        {predictions && (
          <motion.div 
            className="glass-card p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${getPhaseColor(predictions.phase)} bg-opacity-20 flex items-center justify-center`}>
                  <PhaseIcon className="w-8 h-8" style={{ color: getPhaseColor(predictions.phase).replace('bg-', '') }} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{currentPhaseInfo.name} Phase</h3>
                  <p className="text-gray-600 dark:text-gray-400">{currentPhaseInfo.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Next Period</p>
                  <p className="font-semibold">{predictions.nextPeriod.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ovulation</p>
                  <p className="font-semibold">{predictions.ovulation.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-pink-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Cycle</span>
            </div>
            <div className="text-2xl font-bold">{predictions?.avgCycleLength || 28} days</div>
            <div className="text-xs text-gray-500">cycle length</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Droplets className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Period</span>
            </div>
            <div className="text-2xl font-bold">{predictions?.avgPeriodLength || 5} days</div>
            <div className="text-xs text-gray-500">period length</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Cycles Tracked</span>
            </div>
            <div className="text-2xl font-bold">{cycles.length}</div>
            <div className="text-xs text-gray-500">total cycles</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Regularity</span>
            </div>
            <div className="text-2xl font-bold">85%</div>
            <div className="text-xs text-gray-500">cycle regularity</div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          {['calendar', 'chart', 'list'].map(view => (
            <motion.button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                selectedView === view 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {view}
            </motion.button>
          ))}
        </div>

        {/* Calendar View */}
        {selectedView === 'calendar' && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Cycle Calendar</h3>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getCalendarDays().map((day, index) => (
                <motion.div
                  key={index}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                    day === null 
                      ? '' 
                      : day.isToday 
                      ? 'bg-pink-500 text-white font-bold' 
                      : day.isWeekend 
                      ? 'bg-gray-100 dark:bg-gray-800' 
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                  }`}
                  whileHover={day ? { scale: 1.05 } : {}}
                  whileTap={day ? { scale: 0.95 } : {}}
                >
                  {day && (
                    <div className="relative">
                      {day.date}
                      {day.entry && (
                        <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
                          day.entry.flow === 'heavy' ? 'bg-pink-600' :
                          day.entry.flow === 'medium' ? 'bg-pink-400' :
                          day.entry.flow === 'light' ? 'bg-pink-200' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-600"></div>
                <span>Heavy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-200"></div>
                <span>Light</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart View */}
        {selectedView === 'chart' && currentCycle && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Mood & Symptoms Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Area type="monotone" dataKey="mood" stroke="#ec4899" fill="url(#moodGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* List View */}
        {selectedView === 'list' && currentCycle && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Cycle Entries</h3>
            <div className="space-y-3">
              {currentCycle.entries.slice().reverse().map((entry, index) => (
                <motion.div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.flow === 'heavy' ? 'bg-pink-600 text-white' :
                            entry.flow === 'medium' ? 'bg-pink-400 text-white' :
                            entry.flow === 'light' ? 'bg-pink-200 text-pink-800' : 'bg-gray-200 text-gray-800'
                          }`}>
                            {entry.flow}
                          </span>
                          <span className="text-sm text-gray-600">Mood: {entry.mood}/5</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {entry.symptoms.map((symptom, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{entry.notes}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Add Entry Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold mb-4">Log Cycle Entry</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Flow</label>
                  <select
                    value={newEntry.flow}
                    onChange={(e) => setNewEntry({...newEntry, flow: e.target.value})}
                    className="input-field"
                  >
                    {flowOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mood (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({...newEntry, mood: parseInt(e.target.value)})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Symptoms</label>
                  <select
                    multiple
                    value={newEntry.symptoms}
                    onChange={(e) => setNewEntry({...newEntry, symptoms: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="input-field"
                    size={4}
                  >
                    {symptomsOptions.map(symptom => (
                      <option key={symptom} value={symptom}>{symptom}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <input
                    type="text"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="Add any notes about how you're feeling..."
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <motion.button
                  onClick={handleAddEntry}
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save Entry
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

        {/* Health Tips */}
        <div className="glass-card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Cycle Health Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700 dark:text-purple-300">Nutrition</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Increase iron-rich foods during period</li>
                <li>• Stay hydrated to reduce bloating</li>
                <li>• Eat magnesium-rich foods for cramps</li>
                <li>• Reduce caffeine and salt intake</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-pink-700 dark:text-pink-300">Self-Care</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Gentle exercise during period</li>
                <li>• Heat therapy for cramps</li>
                <li>• Practice stress reduction techniques</li>
                <li>• Maintain consistent sleep schedule</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PeriodTracker;
