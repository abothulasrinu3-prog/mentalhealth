import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Cloud, Activity, TrendingUp, Clock, Calendar, Brain, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import WellnessScene3D from '../components/WellnessScene3D';

const SleepAnalysis = () => {
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sleepGoal, setSleepGoal] = useState(8);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSleepEntry, setNewSleepEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    bedTime: '22:00',
    wakeTime: '06:00',
    quality: 3,
    notes: ''
  });

  // Mock sleep data generation
  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const bedTime = new Date(date);
      bedTime.setHours(22 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
      
      const wakeTime = new Date(bedTime);
      wakeTime.setHours(wakeTime.getHours() + 6 + Math.floor(Math.random() * 4));
      
      const totalHours = (wakeTime - bedTime) / (1000 * 60 * 60);
      
      data.push({
        id: i + 1,
        date: date.toISOString().split('T')[0],
        bedTime: bedTime.toTimeString().slice(0, 5),
        wakeTime: wakeTime.toTimeString().slice(0, 5),
        totalHours: Math.round(totalHours * 10) / 10,
        deepSleep: Math.round((totalHours * 0.2 + Math.random() * 0.5) * 10) / 10,
        remSleep: Math.round((totalHours * 0.25 + Math.random() * 0.3) * 10) / 10,
        lightSleep: Math.round((totalHours * 0.5 + Math.random() * 0.3) * 10) / 10,
        quality: Math.floor(Math.random() * 3) + 3,
        efficiency: Math.round((75 + Math.random() * 20)),
        notes: Math.random() > 0.7 ? ['Stressful day', 'Good exercise', 'Late dinner', 'Meditated before bed'][Math.floor(Math.random() * 4)] : ''
      });
    }
    setSleepData(data);
    setLoading(false);
  };

  const getSleepQuality = (quality) => {
    const qualities = {
      1: { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' },
      2: { label: 'Fair', color: 'text-orange-600', bg: 'bg-orange-100' },
      3: { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      4: { label: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-100' },
      5: { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' }
    };
    return qualities[quality] || qualities[3];
  };

  const calculateSleepDebt = () => {
    const last7Days = sleepData.slice(-7);
    const totalSleep = last7Days.reduce((sum, day) => sum + day.totalHours, 0);
    const idealSleep = 7 * sleepGoal;
    return Math.round((idealSleep - totalSleep) * 10) / 10;
  };

  const getAverageStats = () => {
    if (sleepData.length === 0) return null;
    
    const last7Days = sleepData.slice(-7);
    return {
      avgHours: Math.round((last7Days.reduce((sum, day) => sum + day.totalHours, 0) / last7Days.length) * 10) / 10,
      avgQuality: Math.round((last7Days.reduce((sum, day) => sum + day.quality, 0) / last7Days.length) * 10) / 10,
      avgEfficiency: Math.round(last7Days.reduce((sum, day) => sum + day.efficiency, 0) / last7Days.length),
      consistency: Math.round((last7Days.filter(day => Math.abs(day.totalHours - sleepGoal) <= 1).length / last7Days.length) * 100)
    };
  };

  const chartData = sleepData.slice(-7).map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: day.totalHours,
    quality: day.quality * 2,
    efficiency: day.efficiency / 10
  }));

  const stagesData = sleepData.slice(-7).reduce((acc, day) => {
    acc.deep += day.deepSleep;
    acc.rem += day.remSleep;
    acc.light += day.lightSleep;
    return acc;
  }, { deep: 0, rem: 0, light: 0 });

  const avgStages = {
    deep: Math.round((stagesData.deep / Math.min(sleepData.length, 7)) * 10) / 10,
    rem: Math.round((stagesData.rem / Math.min(sleepData.length, 7)) * 10) / 10,
    light: Math.round((stagesData.light / Math.min(sleepData.length, 7)) * 10) / 10
  };

  const handleAddSleepEntry = () => {
    const bedTime = new Date(`${newSleepEntry.date}T${newSleepEntry.bedTime}`);
    const wakeTime = new Date(`${newSleepEntry.date}T${newSleepEntry.wakeTime}`);
    
    if (wakeTime <= bedTime) {
      wakeTime.setDate(wakeTime.getDate() + 1);
    }
    
    const totalHours = (wakeTime - bedTime) / (1000 * 60 * 60);
    
    const newEntry = {
      id: sleepData.length + 1,
      date: newSleepEntry.date,
      bedTime: newSleepEntry.bedTime,
      wakeTime: newSleepEntry.wakeTime,
      totalHours: Math.round(totalHours * 10) / 10,
      deepSleep: Math.round((totalHours * 0.2) * 10) / 10,
      remSleep: Math.round((totalHours * 0.25) * 10) / 10,
      lightSleep: Math.round((totalHours * 0.55) * 10) / 10,
      quality: parseInt(newSleepEntry.quality),
      efficiency: Math.round(80 + Math.random() * 15),
      notes: newSleepEntry.notes
    };
    
    setSleepData([...sleepData, newEntry]);
    setShowAddForm(false);
    setNewSleepEntry({
      date: new Date().toISOString().split('T')[0],
      bedTime: '22:00',
      wakeTime: '06:00',
      quality: 3,
      notes: ''
    });
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
    );
  }

  const stats = getAverageStats();

  return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="wellness-hero-panel p-5 md:p-7">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr,360px]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Cloud className="h-4 w-4" />
                Night recovery lab
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">
                Sleep Analysis
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300 md:text-lg">
                Track sleep duration, stage balance, consistency, and recovery debt with a calmer dashboard built for quick nightly logging.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Goal</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-300">{sleepGoal}h</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Average</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-600 dark:text-cyan-300">{stats?.avgHours || 0}h</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Consistency</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-300">{stats?.consistency || 0}%</p>
                </div>
              </div>
            </div>
            <WellnessScene3D variant="sleep" compact />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <motion.button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sun className="w-5 h-5" />
              Log Sleep
            </motion.button>
            <label className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm font-medium text-gray-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
              <span>Goal</span>
              <input
                type="number"
                min="4"
                max="12"
                value={sleepGoal}
                onChange={(event) => setSleepGoal(Number(event.target.value) || 8)}
                className="w-16 rounded-xl border border-gray-200 bg-white px-2 py-1 text-center dark:border-gray-700 dark:bg-slate-900"
              />
              <span>hours</span>
            </label>
          </div>
        </div>

        {/* Add Sleep Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold mb-4">Log Your Sleep</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={newSleepEntry.date}
                    onChange={(e) => setNewSleepEntry({...newSleepEntry, date: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sleep Quality</label>
                  <select
                    value={newSleepEntry.quality}
                    onChange={(e) => setNewSleepEntry({...newSleepEntry, quality: e.target.value})}
                    className="input-field"
                  >
                    <option value={1}>Poor</option>
                    <option value={2}>Fair</option>
                    <option value={3}>Good</option>
                    <option value={4}>Very Good</option>
                    <option value={5}>Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bedtime</label>
                  <input
                    type="time"
                    value={newSleepEntry.bedTime}
                    onChange={(e) => setNewSleepEntry({...newSleepEntry, bedTime: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Wake Time</label>
                  <input
                    type="time"
                    value={newSleepEntry.wakeTime}
                    onChange={(e) => setNewSleepEntry({...newSleepEntry, wakeTime: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <input
                    type="text"
                    value={newSleepEntry.notes}
                    onChange={(e) => setNewSleepEntry({...newSleepEntry, notes: e.target.value})}
                    placeholder="e.g., stressful day, exercised, meditated"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <motion.button
                  onClick={handleAddSleepEntry}
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save Sleep Entry
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

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Sleep</span>
              </div>
              <div className="text-2xl font-bold">{stats.avgHours}h</div>
              <div className="text-xs text-gray-500">Goal: {sleepGoal}h</div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Sleep Quality</span>
              </div>
              <div className="text-2xl font-bold">{stats.avgQuality}/5</div>
              <div className={`text-xs ${getSleepQuality(Math.round(stats.avgQuality)).color}`}>
                {getSleepQuality(Math.round(stats.avgQuality)).label}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
              </div>
              <div className="text-2xl font-bold">{stats.avgEfficiency}%</div>
              <div className="text-xs text-gray-500">Time asleep in bed</div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Consistency</span>
              </div>
              <div className="text-2xl font-bold">{stats.consistency}%</div>
              <div className="text-xs text-gray-500">Within 1hr of goal</div>
            </div>
          </div>
        )}

        {/* Sleep Debt Alert */}
        {calculateSleepDebt() > 0 && (
          <motion.div 
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Sleep Debt Detected</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You're {calculateSleepDebt()} hours behind on sleep this week. Try to get extra rest tonight.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sleep Duration Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Sleep Duration (Last 7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis domain={[0, 12]} stroke="#9ca3af" />
                  <Tooltip />
                  <Area type="monotone" dataKey="hours" stroke="#6366f1" fill="url(#sleepGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Stages Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Average Sleep Stages</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { stage: 'Deep', hours: avgStages.deep, fill: '#4f46e5' },
                  { stage: 'REM', hours: avgStages.rem, fill: '#7c3aed' },
                  { stage: 'Light', hours: avgStages.light, fill: '#a78bfa' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="stage" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                <div className="text-xs text-gray-600 dark:text-gray-400">Deep</div>
                <div className="font-semibold">{avgStages.deep}h</div>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <div className="text-xs text-gray-600 dark:text-gray-400">REM</div>
                <div className="font-semibold">{avgStages.rem}h</div>
              </div>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-800/30 rounded">
                <div className="text-xs text-gray-600 dark:text-gray-400">Light</div>
                <div className="font-semibold">{avgStages.light}h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sleep Entries */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Sleep Entries</h3>
          <div className="space-y-3">
            {sleepData.slice(-5).reverse().map((entry) => (
              <motion.div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-medium">{entry.totalHours}h</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Quality</div>
                    <div className={`font-medium ${getSleepQuality(entry.quality).color}`}>
                      {getSleepQuality(entry.quality).label}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Schedule</div>
                    <div className="font-medium">{entry.bedTime} - {entry.wakeTime}</div>
                  </div>
                </div>
                {entry.notes && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                    "{entry.notes}"
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sleep Tips */}
        <div className="glass-card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Sleep Improvement Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-indigo-700 dark:text-indigo-300">Sleep Hygiene</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Keep bedroom cool (60-67°F / 15-19°C)</li>
                <li>• Maintain consistent sleep schedule</li>
                <li>• Avoid screens 1 hour before bed</li>
                <li>• Create a relaxing bedtime routine</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700 dark:text-purple-300">Lifestyle Factors</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Exercise regularly (but not before bed)</li>
                <li>• Limit caffeine after 2 PM</li>
                <li>• Avoid alcohol before sleep</li>
                <li>• Manage stress with meditation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SleepAnalysis;
