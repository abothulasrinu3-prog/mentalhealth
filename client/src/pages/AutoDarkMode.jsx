import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Clock, MapPin, Settings, Eye, Battery, Smartphone, Check, Info } from 'lucide-react';

const AutoDarkMode = () => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [mode, setMode] = useState('auto'); // 'auto', 'manual', 'scheduled'
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState({
    enabled: true,
    startTime: '20:00',
    endTime: '06:00'
  });
  const [locationBased, setLocationBased] = useState(false);
  const [sunTimes, setSunTimes] = useState({
    sunrise: '06:15',
    sunset: '18:45'
  });
  const [eyeProtection, setEyeProtection] = useState({
    enabled: true,
    blueLightFilter: 30,
    brightness: 80
  });
  const [batterySaver, setBatterySaver] = useState(true);

  useEffect(() => {
    // Simulate loading and detecting current theme
    const isDark = document.documentElement.classList.contains('dark');
    setCurrentTheme(isDark ? 'dark' : 'light');
    setLoading(false);
  }, []);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'auto') {
      // Auto-detect based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      handleThemeChange(prefersDark ? 'dark' : 'light');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            className="relative w-20 h-20 mx-auto mb-4"
            animate={{ rotate: currentTheme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {currentTheme === 'light' ? (
              <Sun className="w-20 h-20 text-yellow-500" />
            ) : (
              <Moon className="w-20 h-20 text-indigo-500" />
            )}
          </motion.div>
          <h1 className="text-3xl font-bold">Auto Dark Mode</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Automatically adjust your theme for comfort
          </p>
          <div className="mt-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              currentTheme === 'dark'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            }`}>
              Currently: {currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
        </div>

        {/* Theme Mode Selection */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Theme Mode</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'auto', label: 'Auto', icon: Monitor, desc: 'Follow system' },
              { id: 'scheduled', label: 'Scheduled', icon: Clock, desc: 'Set times' },
              { id: 'manual', label: 'Manual', icon: Settings, desc: 'Your choice' }
            ].map((m) => (
              <motion.button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  mode === m.id
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <m.icon className={`w-8 h-8 mx-auto mb-2 ${mode === m.id ? 'text-violet-500' : 'text-gray-400'}`} />
                <p className="font-medium">{m.label}</p>
                <p className="text-xs text-gray-500">{m.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quick Theme Toggle */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Toggle</h2>
          <div className="flex justify-center gap-4">
            <motion.button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 p-6 rounded-xl border-2 transition-colors ${
                currentTheme === 'light'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sun className={`w-12 h-12 mx-auto mb-2 ${currentTheme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
              <p className="font-medium">Light</p>
            </motion.button>
            <motion.button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 p-6 rounded-xl border-2 transition-colors ${
                currentTheme === 'dark'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Moon className={`w-12 h-12 mx-auto mb-2 ${currentTheme === 'dark' ? 'text-indigo-500' : 'text-gray-400'}`} />
              <p className="font-medium">Dark</p>
            </motion.button>
          </div>
        </div>

        {/* Scheduled Dark Mode */}
        {mode === 'scheduled' && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-500" />
              Schedule Settings
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span>Enable scheduled mode</span>
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
                  className="w-5 h-5"
                />
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dark Mode Starts</label>
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Light Mode Starts</label>
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                <p className="text-sm text-violet-700 dark:text-violet-300">
                  Dark mode will be active from <strong>{schedule.startTime}</strong> to <strong>{schedule.endTime}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Location-Based (Sunrise/Sunset) */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              Location-Based
            </h2>
            <input
              type="checkbox"
              checked={locationBased}
              onChange={(e) => setLocationBased(e.target.checked)}
              className="w-5 h-5"
            />
          </div>
          
          {locationBased && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Theme will automatically adjust based on local sunrise and sunset times
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                  <Sun className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm text-gray-500">Sunrise</p>
                  <p className="font-semibold">{sunTimes.sunrise}</p>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
                  <Moon className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                  <p className="text-sm text-gray-500">Sunset</p>
                  <p className="font-semibold">{sunTimes.sunset}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Eye Protection */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Eye Protection
            </h2>
            <input
              type="checkbox"
              checked={eyeProtection.enabled}
              onChange={(e) => setEyeProtection({ ...eyeProtection, enabled: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          {eyeProtection.enabled && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Blue Light Filter</label>
                  <span className="text-sm text-gray-500">{eyeProtection.blueLightFilter}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={eyeProtection.blueLightFilter}
                  onChange={(e) => setEyeProtection({ ...eyeProtection, blueLightFilter: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Brightness</label>
                  <span className="text-sm text-gray-500">{eyeProtection.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={eyeProtection.brightness}
                  onChange={(e) => setEyeProtection({ ...eyeProtection, brightness: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Battery Saver */}
        <div className="glass-card p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Battery className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Battery Saver Mode</p>
                <p className="text-sm text-gray-500">Enable dark mode when battery is low</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={batterySaver}
              onChange={(e) => setBatterySaver(e.target.checked)}
              className="w-5 h-5"
            />
          </label>
        </div>

        {/* Benefits */}
        <div className="glass-card p-6 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
          <h3 className="font-semibold text-violet-800 dark:text-violet-200 mb-3">Benefits of Dark Mode</h3>
          <div className="grid gap-3">
            {[
              'Reduces eye strain in low-light conditions',
              'May improve sleep quality by reducing blue light',
              'Saves battery on OLED screens',
              'Can reduce headaches and migraines',
              'Provides a comfortable reading experience at night'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-violet-700 dark:text-violet-300">
                <Check className="w-4 h-4 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default AutoDarkMode;
