import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Calendar, Database, Mail, Share2, Check, AlertCircle, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const DataExport = () => {
  const [exportData, setExportData] = useState({
    moodEntries: [],
    journalEntries: [],
    sleepData: [],
    habits: [],
    medications: [],
    workouts: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [selectedDataTypes, setSelectedDataTypes] = useState([
    'mood', 'journal', 'sleep', 'habits', 'medications', 'workouts'
  ]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const dataTypes = [
    { id: 'mood', label: 'Mood Entries', icon: BarChart3, color: '#8b5cf6', count: 45 },
    { id: 'journal', label: 'Journal Entries', icon: FileText, color: '#3b82f6', count: 23 },
    { id: 'sleep', label: 'Sleep Data', icon: Calendar, color: '#10b981', count: 30 },
    { id: 'habits', label: 'Habits', icon: TrendingUp, color: '#f59e0b', count: 6 },
    { id: 'medications', label: 'Medications', icon: Database, color: '#ef4444', count: 3 },
    { id: 'workouts', label: 'Workouts', icon: PieChart, color: '#06b6d4', count: 12 }
  ];

  const exportFormats = [
    { id: 'json', label: 'JSON', description: 'Machine-readable format', extension: '.json' },
    { id: 'csv', label: 'CSV', description: 'Excel-compatible format', extension: '.csv' },
    { id: 'pdf', label: 'PDF', description: 'Printable report format', extension: '.pdf' },
    { id: 'xml', label: 'XML', description: 'Structured data format', extension: '.xml' }
  ];

  // Generate mock export data
  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    const mockData = {
      moodEntries: generateMoodEntries(),
      journalEntries: generateJournalEntries(),
      sleepData: generateSleepData(),
      habits: generateHabits(),
      medications: generateMedications(),
      workouts: generateWorkouts()
    };
    
    setExportData(mockData);
    setLoading(false);
  };

  const generateMoodEntries = () => {
    const entries = [];
    for (let i = 44; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      entries.push({
        id: i + 1,
        date: date.toISOString().split('T')[0],
        mood: 3 + Math.floor(Math.random() * 3),
        anxiety: Math.floor(Math.random() * 5) + 1,
        stress: Math.floor(Math.random() * 5) + 1,
        energy: Math.floor(Math.random() * 5) + 1,
        notes: Math.random() > 0.7 ? 'Feeling good today' : ''
      });
    }
    return entries;
  };

  const generateJournalEntries = () => {
    const entries = [];
    for (let i = 22; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 2);
      entries.push({
        id: i + 1,
        date: date.toISOString().split('T')[0],
        title: `Journal Entry ${i + 1}`,
        content: 'Today was an interesting day. I learned a lot about myself and my emotions.',
        moodTag: ['grateful', 'anxious', 'hopeful'][Math.floor(Math.random() * 3)],
        tags: ['personal', 'growth', 'reflection']
      });
    }
    return entries;
  };

  const generateSleepData = () => {
    const entries = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      entries.push({
        id: i + 1,
        date: date.toISOString().split('T')[0],
        bedTime: '22:30',
        wakeTime: '06:30',
        totalHours: 7 + Math.random() * 2,
        quality: Math.floor(Math.random() * 3) + 3,
        efficiency: 80 + Math.floor(Math.random() * 20)
      });
    }
    return entries;
  };

  const generateHabits = () => {
    return [
      {
        id: 1,
        name: 'Meditation',
        category: 'mindfulness',
        streak: 12,
        completed: true,
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: Math.random() > 0.2
        }))
      },
      {
        id: 2,
        name: 'Exercise',
        category: 'fitness',
        streak: 5,
        completed: false,
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: Math.random() > 0.4
        }))
      }
    ];
  };

  const generateMedications = () => {
    return [
      {
        id: 1,
        name: 'Vitamin D',
        dosage: '1000 IU',
        frequency: 'daily',
        adherence: 92,
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          taken: Math.random() > 0.08
        }))
      }
    ];
  };

  const generateWorkouts = () => {
    const workouts = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 3);
      workouts.push({
        id: i + 1,
        date: date.toISOString().split('T')[0],
        name: ['Strength Training', 'Cardio', 'Yoga'][Math.floor(Math.random() * 3)],
        duration: 30 + Math.floor(Math.random() * 30),
        calories: 200 + Math.floor(Math.random() * 200),
        mood_before: Math.floor(Math.random() * 3) + 2,
        mood_after: Math.floor(Math.random() * 3) + 3
      });
    }
    return workouts;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportProgress(i);
    }

    // Generate export data based on selected types
    const filteredData = {};
    selectedDataTypes.forEach(type => {
      switch (type) {
        case 'mood':
          filteredData.moodEntries = exportData.moodEntries.filter(entry => 
            entry.date >= dateRange.start && entry.date <= dateRange.end
          );
          break;
        case 'journal':
          filteredData.journalEntries = exportData.journalEntries.filter(entry => 
            entry.date >= dateRange.start && entry.date <= dateRange.end
          );
          break;
        case 'sleep':
          filteredData.sleepData = exportData.sleepData.filter(entry => 
            entry.date >= dateRange.start && entry.date <= dateRange.end
          );
          break;
        case 'habits':
          filteredData.habits = exportData.habits.map(habit => ({
            ...habit,
            history: habit.history.filter(entry => 
              entry.date >= dateRange.start && entry.date <= dateRange.end
            )
          }));
          break;
        case 'medications':
          filteredData.medications = exportData.medications.map(med => ({
            ...med,
            history: med.history.filter(entry => 
              entry.date >= dateRange.start && entry.date <= dateRange.end
            )
          }));
          break;
        case 'workouts':
          filteredData.workouts = exportData.workouts.filter(workout => 
            workout.date >= dateRange.start && workout.date <= dateRange.end
          );
          break;
      }
    });

    // Create and download file
    const format = exportFormats.find(f => f.id === selectedFormat);
    const filename = `mindcare-export-${new Date().toISOString().split('T')[0]}${format.extension}`;
    
    let content;
    switch (selectedFormat) {
      case 'json':
        content = JSON.stringify(filteredData, null, 2);
        break;
      case 'csv':
        content = convertToCSV(filteredData);
        break;
      case 'pdf':
        content = generatePDFContent(filteredData);
        break;
      case 'xml':
        content = convertToXML(filteredData);
        break;
    }

    downloadFile(content, filename, selectedFormat);
    
    setIsExporting(false);
    setExportComplete(true);
    setTimeout(() => setExportComplete(false), 3000);
  };

  const convertToCSV = (data) => {
    let csv = '';
    
    if (data.moodEntries) {
      csv += 'Mood Entries\n';
      csv += 'Date,Mood,Anxiety,Stress,Energy,Notes\n';
      data.moodEntries.forEach(entry => {
        csv += `${entry.date},${entry.mood},${entry.anxiety},${entry.stress},${entry.energy},"${entry.notes}"\n`;
      });
      csv += '\n';
    }
    
    return csv;
  };

  const generatePDFContent = (data) => {
    return `MindCare AI Data Export Report
Generated: ${new Date().toLocaleDateString()}

Summary:
- Mood Entries: ${data.moodEntries?.length || 0}
- Journal Entries: ${data.journalEntries?.length || 0}
- Sleep Records: ${data.sleepData?.length || 0}
- Habits: ${data.habits?.length || 0}
- Medications: ${data.medications?.length || 0}
- Workouts: ${data.workouts?.length || 0}

This is a formatted PDF report of your mental health data.`;
  };

  const convertToXML = (data) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<mindcare-export>
  <generated>${new Date().toISOString()}</generated>
  <data>${JSON.stringify(data)}</data>
</mindcare-export>`;
  };

  const downloadFile = (content, filename, format) => {
    const blob = new Blob([content], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleDataType = (type) => {
    setSelectedDataTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getTotalEntries = () => {
    return selectedDataTypes.reduce((total, type) => {
      const dataType = dataTypes.find(d => d.id === type);
      return total + (dataType?.count || 0);
    }, 0);
  };

  const getChartData = () => {
    return dataTypes.map(type => ({
      name: type.label,
      value: type.count,
      color: type.color
    }));
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
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Download className="w-8 h-8 text-blue-500" />
            Data Export
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl mx-auto">
            Download your mental health data in various formats for personal records or sharing with healthcare providers
          </p>
        </div>

        {/* Data Overview */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Your Data Overview</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={getChartData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {dataTypes.map(type => (
                <div key={type.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <type.icon className="w-5 h-5" style={{ color: type.color }} />
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <span className="text-sm text-gray-600">{type.count} entries</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Configuration */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Export Configuration</h3>
          
          {/* Data Types Selection */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Select Data Types</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dataTypes.map(type => (
                <motion.label
                  key={type.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDataTypes.includes(type.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDataTypes.includes(type.id)}
                    onChange={() => toggleDataType(type.id)}
                    className="rounded"
                  />
                  <type.icon className="w-4 h-4" style={{ color: type.color }} />
                  <span className="text-sm font-medium">{type.label}</span>
                </motion.label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Date Range</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Export Format</h4>
            <div className="grid grid-cols-2 gap-4">
              {exportFormats.map(format => (
                <motion.label
                  key={format.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === format.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={selectedFormat === format.id}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{format.label}</div>
                    <div className="text-sm text-gray-600">{format.description}</div>
                  </div>
                </motion.label>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total entries to export:</span>
              <span className="text-lg font-bold text-blue-600">{getTotalEntries()}</span>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex items-center justify-between">
            <motion.button
              onClick={handleExport}
              disabled={selectedDataTypes.length === 0 || isExporting}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: selectedDataTypes.length > 0 && !isExporting ? 1.05 : 1 }}
              whileTap={{ scale: selectedDataTypes.length > 0 && !isExporting ? 0.95 : 1 }}
            >
              <Download className="w-5 h-5" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </motion.button>

            {exportComplete && (
              <motion.div
                className="flex items-center gap-2 text-green-600"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Check className="w-5 h-5" />
                <span>Export completed successfully!</span>
              </motion.div>
            )}
          </div>

          {/* Progress Bar */}
          <AnimatePresence>
            {isExporting && (
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${exportProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-center text-sm text-gray-600 mt-2">
                  {exportProgress}% complete
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Privacy & Security */}
        <div className="glass-card p-6 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            Privacy & Security
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Data Protection</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• All data is encrypted during export</li>
                <li>• No personal information is shared</li>
                <li>• You maintain full ownership of your data</li>
                <li>• Export files are stored locally on your device</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-700 dark:text-green-300">Recommended Usage</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Share with healthcare providers for better care</li>
                <li>• Keep personal backups of your progress</li>
                <li>• Analyze trends in external tools</li>
                <li>• Maintain records for insurance purposes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <motion.button
              onClick={() => {
                setSelectedDataTypes(['mood', 'journal', 'sleep']);
                setSelectedFormat('pdf');
              }}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText className="w-6 h-6 text-blue-500 mb-2" />
              <div className="font-medium">Therapy Report</div>
              <div className="text-sm text-gray-600">Mood, journal & sleep data</div>
            </motion.button>

            <motion.button
              onClick={() => {
                setSelectedDataTypes(['habits', 'medications', 'workouts']);
                setSelectedFormat('csv');
              }}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 className="w-6 h-6 text-green-500 mb-2" />
              <div className="font-medium">Wellness Metrics</div>
              <div className="text-sm text-gray-600">Habits, meds & workouts</div>
            </motion.button>

            <motion.button
              onClick={() => {
                setSelectedDataTypes(dataTypes.map(d => d.id));
                setSelectedFormat('json');
              }}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Database className="w-6 h-6 text-purple-500 mb-2" />
              <div className="font-medium">Complete Backup</div>
              <div className="text-sm text-gray-600">All your data in JSON</div>
            </motion.button>
          </div>
        </div>
      </div>
  );
};

export default DataExport;
