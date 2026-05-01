import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Clock, Calendar, Bell, Plus, Check, X, AlertCircle, Heart, Brain, Activity } from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const MedicationReminders = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    time: ['09:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    color: '#6366f1'
  });

  // Mock medication data
  useEffect(() => {
    generateMockData();
    checkMedicationTimes();
    const interval = setInterval(checkMedicationTimes, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const generateMockData = () => {
    const mockMeds = [
      {
        id: 1,
        name: 'Sertraline',
        dosage: '50mg',
        frequency: 'daily',
        time: ['09:00'],
        startDate: '2024-01-01',
        endDate: '',
        notes: 'Take with breakfast',
        color: '#6366f1',
        active: true,
        adherence: 85,
        history: generateHistory('daily')
      },
      {
        id: 2,
        name: 'Melatonin',
        dosage: '5mg',
        frequency: 'daily',
        time: ['22:00'],
        startDate: '2024-01-15',
        endDate: '',
        notes: 'Take 30 min before bedtime',
        color: '#8b5cf6',
        active: true,
        adherence: 92,
        history: generateHistory('daily')
      },
      {
        id: 3,
        name: 'Vitamin D',
        dosage: '1000 IU',
        frequency: 'weekly',
        time: ['10:00'],
        startDate: '2024-01-01',
        endDate: '',
        notes: 'Take with meal',
        color: '#10b981',
        active: true,
        adherence: 78,
        history: generateHistory('weekly')
      }
    ];
    setMedications(mockMeds);
    setLoading(false);
  };

  const generateHistory = (frequency) => {
    const history = [];
    const days = frequency === 'daily' ? 30 : 12;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      if (frequency === 'weekly' && i % 7 !== 0) continue;
      
      history.push({
        date: date.toISOString().split('T')[0],
        taken: Math.random() > 0.2,
        time: frequency === 'daily' ? 
          `${9 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : 
          '10:00'
      });
    }
    return history;
  };

  const checkMedicationTimes = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    medications.forEach(med => {
      if (!med.active) return;
      
      med.time.forEach(time => {
        if (time === currentTime) {
          addNotification(med);
        }
      });
    });
  };

  const addNotification = (medication) => {
    const notification = {
      id: Date.now(),
      medicationId: medication.id,
      medication: medication.name,
      dosage: medication.dosage,
      time: new Date(),
      acknowledged: false
    };
    
    setNotifications(prev => [notification, ...prev].slice(0, 5));
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medication Reminder', {
        body: `Time to take ${medication.name} - ${medication.dosage}`,
        icon: '/pill-icon.png'
      });
    }
  };

  const handleAddMedication = () => {
    const med = {
      ...newMedication,
      id: medications.length + 1,
      active: true,
      adherence: 100,
      history: []
    };
    
    setMedications([...medications, med]);
    setShowAddForm(false);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'daily',
      time: ['09:00'],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      color: '#6366f1'
    });
  };

  const markAsTaken = (medicationId) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setMedications(meds => meds.map(med => {
      if (med.id === medicationId) {
        const newHistory = [
          {
            date: now.toISOString().split('T')[0],
            taken: true,
            time: currentTime
          },
          ...med.history
        ];
        
        const adherence = Math.round((newHistory.filter(h => h.taken).length / newHistory.length) * 100);
        
        return {
          ...med,
          history: newHistory.slice(0, 30),
          adherence
        };
      }
      return med;
    }));
    
    // Remove notification
    setNotifications(prev => prev.filter(n => n.medicationId !== medicationId));
  };

  const skipMedication = (medicationId) => {
    setMedications(meds => meds.map(med => {
      if (med.id === medicationId) {
        const newHistory = [
          {
            date: new Date().toISOString().split('T')[0],
            taken: false,
            time: new Date().toTimeString().slice(0, 5)
          },
          ...med.history
        ];
        
        const adherence = Math.round((newHistory.filter(h => h.taken).length / newHistory.length) * 100);
        
        return {
          ...med,
          history: newHistory.slice(0, 30),
          adherence
        };
      }
      return med;
    }));
    
    setNotifications(prev => prev.filter(n => n.medicationId !== medicationId));
  };

  const toggleMedication = (medicationId) => {
    setMedications(meds => meds.map(med => 
      med.id === medicationId ? { ...med, active: !med.active } : med
    ));
  };

  const deleteMedication = (medicationId) => {
    setMedications(meds => meds.filter(med => med.id !== medicationId));
  };

  const getAdherenceColor = (adherence) => {
    if (adherence >= 90) return 'text-green-600';
    if (adherence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAdherenceLabel = (adherence) => {
    if (adherence >= 90) return 'Excellent';
    if (adherence >= 70) return 'Good';
    if (adherence >= 50) return 'Fair';
    return 'Poor';
  };

  const upcomingMeds = medications.filter(med => 
    med.active && med.time.some(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const medTime = new Date();
      medTime.setHours(hours, minutes, 0, 0);
      const now = new Date();
      const diff = medTime - now;
      return diff > 0 && diff < 3600000; // Within next hour
    })
  );

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
          variant="medication"
          eyebrow="Care schedule"
          title="Medication Reminders"
          description="A clearer reminder command center with 3D medication rhythm, adherence cues, and daily safety prompts."
          metrics={['Schedule', 'Adherence', 'Alerts']}
        />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Pill className="w-8 h-8 text-indigo-500" />
              Medication Reminders
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Never miss your medication with smart reminders
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
              Add Medication
            </motion.button>
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {notifications.length > 0 && (
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {notifications.map(notification => (
                <motion.div
                  key={notification.id}
                  className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-indigo-600 animate-pulse" />
                      <div>
                        <p className="font-semibold text-indigo-800 dark:text-indigo-200">
                          Time to take {notification.medication}
                        </p>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                          Dosage: {notification.dosage}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => markAsTaken(notification.medicationId)}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg flex items-center gap-1 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Check className="w-4 h-4" />
                        Taken
                      </motion.button>
                      <motion.button
                        onClick={() => skipMedication(notification.medicationId)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg flex items-center gap-1 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="w-4 h-4" />
                        Skip
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Medication Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold mb-4">Add New Medication</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Medication Name</label>
                  <input
                    type="text"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                    placeholder="e.g., Sertraline"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dosage</label>
                  <input
                    type="text"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                    placeholder="e.g., 50mg"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <select
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                    className="input-field"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="as-needed">As Needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newMedication.time[0]}
                    onChange={(e) => setNewMedication({...newMedication, time: [e.target.value]})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newMedication.startDate}
                    onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date (optional)</label>
                  <input
                    type="date"
                    value={newMedication.endDate}
                    onChange={(e) => setNewMedication({...newMedication, endDate: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <input
                    type="text"
                    value={newMedication.notes}
                    onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                    placeholder="e.g., Take with food, avoid alcohol"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <motion.button
                  onClick={handleAddMedication}
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Medication
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Pill className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Meds</span>
            </div>
            <div className="text-2xl font-bold">{medications.length}</div>
            <div className="text-xs text-gray-500">
              {medications.filter(m => m.active).length} active
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Adherence</span>
            </div>
            <div className="text-2xl font-bold">
              {medications.length > 0 ? 
                Math.round(medications.reduce((sum, med) => sum + med.adherence, 0) / medications.length) : 
                0}%
            </div>
            <div className="text-xs text-gray-500">Last 30 days</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
            </div>
            <div className="text-2xl font-bold">{upcomingMeds.length}</div>
            <div className="text-xs text-gray-500">Next hour</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Consistency</span>
            </div>
            <div className="text-2xl font-bold">
              {medications.filter(m => m.adherence >= 80).length}/{medications.length}
            </div>
            <div className="text-xs text-gray-500">≥80% adherence</div>
          </div>
        </div>

        {/* Medications List */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Your Medications</h3>
            <motion.button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-primary-500 hover:text-primary-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showHistory ? 'Hide' : 'Show'} History
            </motion.button>
          </div>
          
          <div className="space-y-4">
            {medications.map(medication => (
              <motion.div
                key={medication.id}
                className={`border rounded-xl p-4 ${
                  medication.active 
                    ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 opacity-60'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: medication.color + '20' }}
                    >
                      <Pill className="w-6 h-6" style={{ color: medication.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{medication.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {medication.dosage} • {medication.frequency} • {medication.time.join(', ')}
                      </p>
                      {medication.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {medication.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getAdherenceColor(medication.adherence)}`}>
                        {medication.adherence}% adherence
                      </div>
                      <div className="text-xs text-gray-500">
                        {getAdherenceLabel(medication.adherence)}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <motion.button
                        onClick={() => markAsTaken(medication.id)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Check className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => toggleMedication(medication.id)}
                        className={`p-2 rounded-lg ${
                          medication.active 
                            ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {medication.active ? <Clock className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </motion.button>
                      <motion.button
                        onClick={() => deleteMedication(medication.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* History */}
                <AnimatePresence>
                  {showHistory && medication.history.length > 0 && (
                    <motion.div 
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <h5 className="text-sm font-medium mb-2">Recent History</h5>
                      <div className="space-y-1">
                        {medication.history.slice(0, 7).map((entry, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">{entry.time}</span>
                              {entry.taken ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Taken
                                </span>
                              ) : (
                                <span className="text-red-600 flex items-center gap-1">
                                  <X className="w-3 h-3" /> Missed
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="glass-card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Medication Management Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-indigo-700 dark:text-indigo-300">Best Practices</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Take medications at the same time daily</li>
                <li>• Use pill organizers for multiple medications</li>
                <li>• Set multiple reminders for important meds</li>
                <li>• Keep a medication journal for side effects</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700 dark:text-purple-300">Safety Tips</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Never share prescription medications</li>
                <li>• Store medications properly (cool, dry place)</li>
                <li>• Check expiration dates regularly</li>
                <li>• Inform doctors about all medications you take</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MedicationReminders;
