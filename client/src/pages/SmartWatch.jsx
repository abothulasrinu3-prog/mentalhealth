import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Watch, Heart, Activity, Moon, Bluetooth, RefreshCw, Check, X, Settings, Smartphone, Zap, Clock, TrendingUp, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SmartWatch = () => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [integrationError, setIntegrationError] = useState('');
  const [device, setDevice] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [watchData, setWatchData] = useState({
    heartRate: [],
    steps: 0,
    sleep: null,
    stress: 0,
    hrv: 0
  });
  const [autoSync, setAutoSync] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const availableDevices = [
    { id: 1, name: 'Apple Watch Series 9', type: 'apple', battery: 85 },
    { id: 2, name: 'Samsung Galaxy Watch 6', type: 'samsung', battery: 72 },
    { id: 3, name: 'Fitbit Sense 2', type: 'fitbit', battery: 90 },
    { id: 4, name: 'Garmin Venu 3', type: 'garmin', battery: 65 }
  ];

  useEffect(() => {
    // Simulate loading
    fetchIntegrationStatus();
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/integrations/status`);
      setIntegrationStatus(response.data.data);
      setIntegrationError('');
    } catch (error) {
      setIntegrationStatus(null);
      setIntegrationError(error.response?.data?.message || 'Unable to load live integration status.');
    }
  };

  const handleConnect = (selectedDevice) => {
    setConnecting(true);
    
    // Simulate connection
    setTimeout(() => {
      setDevice(selectedDevice);
      setConnected(true);
      setConnecting(false);
      setWatchData({
        heartRate: [
          { time: '6am', value: 62 },
          { time: '9am', value: 75 },
          { time: '12pm', value: 82 },
          { time: '3pm', value: 78 },
          { time: '6pm', value: 85 },
          { time: '9pm', value: 68 }
        ],
        steps: 8432,
        sleep: {
          duration: '7h 23m',
          quality: 'Good',
          deep: '1h 45m',
          rem: '1h 12m'
        },
        stress: 42,
        hrv: 58
      });
    }, 2000);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setDevice(null);
    setWatchData({
      heartRate: [],
      steps: 0,
      sleep: null,
      stress: 0,
      hrv: 0
    });
  };

  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const wellnessProviders = integrationStatus?.wellness?.providers || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Watch className="w-8 h-8 text-blue-500" />
              Smart Watch Integration
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Check live wearable provider readiness and explore the demo wearable dashboard
            </p>
          </div>
          {connected && (
            <motion.button
              onClick={() => setShowSettings(true)}
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5" />
              Settings
            </motion.button>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Live Integration Status</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Google Fit is the practical web integration. Health Connect needs an Android app layer, and the other mental-health APIs still need verified public developer access before we wire them in.
              </p>
            </div>
            <motion.button
              onClick={fetchIntegrationStatus}
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </motion.button>
          </div>

          {integrationError && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-300">{integrationError}</p>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {wellnessProviders.map((provider) => (
              <div
                key={provider.id}
                className="rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-800/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{provider.label}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{provider.note}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      provider.configured
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : provider.platform === 'android-only'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {provider.configured ? 'Configured' : provider.platform === 'android-only' ? 'Android only' : 'Not wired'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {provider.auth && <span>Auth: {provider.auth}</span>}
                  {provider.category && <span>Category: {provider.category}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        {!connected ? (
          <div className="glass-card p-6">
            <div className="text-center mb-6">
              <Bluetooth className={`w-16 h-16 mx-auto mb-4 ${connecting ? 'text-blue-500 animate-pulse' : 'text-gray-300'}`} />
              <h2 className="text-xl font-semibold mb-2">
                {connecting ? 'Connecting...' : 'Demo Wearable Simulator'}
              </h2>
              <p className="text-gray-500">
                {connecting ? 'Please wait while we establish connection' : 'Select a demo device to explore the watch dashboard UI'}
              </p>
            </div>

            {!connecting && (
              <div className="grid gap-3">
                {availableDevices.map((d) => (
                  <motion.button
                    key={d.id}
                    onClick={() => handleConnect(d)}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Watch className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{d.name}</p>
                        <p className="text-sm text-gray-500">{d.battery}% battery</p>
                      </div>
                    </div>
                    <Bluetooth className="w-5 h-5 text-gray-400" />
                  </motion.button>
                ))}
              </div>
            )}

            {connecting && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Connected Device Info */}
            <div className="glass-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Watch className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{device?.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Connected
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleSync}
                    disabled={syncStatus === 'syncing'}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <RefreshCw className={`w-5 h-5 ${syncStatus === 'syncing' ? 'animate-spin text-blue-500' : 'text-gray-500'}`} />
                  </motion.button>
                  <button
                    onClick={handleDisconnect}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {syncStatus === 'synced' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300"
                >
                  <Check className="w-5 h-5" />
                  Data synced successfully
                </motion.div>
              )}
            </div>

            {/* Health Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-500">Heart Rate</span>
                </div>
                <p className="text-2xl font-bold">{watchData.heartRate[watchData.heartRate.length - 1]?.value || '--'} <span className="text-sm font-normal">bpm</span></p>
              </div>
              
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-500">Steps</span>
                </div>
                <p className="text-2xl font-bold">{watchData.steps.toLocaleString()}</p>
              </div>
              
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-500">Stress Level</span>
                </div>
                <p className="text-2xl font-bold">{watchData.stress} <span className="text-sm font-normal">/100</span></p>
              </div>
              
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-500">HRV</span>
                </div>
                <p className="text-2xl font-bold">{watchData.hrv} <span className="text-sm font-normal">ms</span></p>
              </div>
            </div>

            {/* Sleep Data */}
            {watchData.sleep && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  Last Night's Sleep
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{watchData.sleep.duration}</p>
                    <p className="text-sm text-gray-500">Duration</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-300">{watchData.sleep.quality}</p>
                    <p className="text-sm text-gray-500">Quality</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{watchData.sleep.deep}</p>
                    <p className="text-sm text-gray-500">Deep Sleep</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{watchData.sleep.rem}</p>
                    <p className="text-sm text-gray-500">REM Sleep</p>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-Sync Settings */}
            <div className="glass-card p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Auto-sync</p>
                    <p className="text-sm text-gray-500">Automatically sync data every hour</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-5 h-5"
                />
              </label>
            </div>
          </>
        )}

        {/* Benefits */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Why Connect Your Watch?</h3>
          <div className="grid gap-4">
            {[
              { icon: Heart, title: 'Continuous Heart Monitoring', desc: 'Track your heart rate 24/7 for better insights' },
              { icon: Activity, title: 'Automatic Activity Tracking', desc: 'Steps, workouts, and calories logged automatically' },
              { icon: Moon, title: 'Sleep Quality Analysis', desc: 'Understand your sleep patterns for better rest' },
              { icon: AlertCircle, title: 'Stress Detection', desc: 'Get alerts when stress levels are elevated' }
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">{benefit.title}</p>
                  <p className="text-sm text-gray-500">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="glass-card p-6 max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3 className="text-xl font-semibold mb-4">Watch Settings</h3>
                <div className="space-y-4">
                  {[
                    { key: 'heartRate', label: 'Heart Rate Monitoring', default: true },
                    { key: 'steps', label: 'Step Counting', default: true },
                    { key: 'sleep', label: 'Sleep Tracking', default: true },
                    { key: 'stress', label: 'Stress Detection', default: true },
                    { key: 'notifications', label: 'Watch Notifications', default: false }
                  ].map((setting) => (
                    <label key={setting.key} className="flex items-center justify-between">
                      <span>{setting.label}</span>
                      <input type="checkbox" defaultChecked={setting.default} className="w-5 h-5" />
                    </label>
                  ))}
                </div>
                <button onClick={() => setShowSettings(false)} className="btn-primary w-full mt-6">
                  Save Settings
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default SmartWatch;
