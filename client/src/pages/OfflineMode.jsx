import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Download, Upload, Cloud, CloudOff, Check, AlertTriangle, RefreshCw, Database, Clock, HardDrive } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const OfflineMode = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState({
    moodEntries: 12,
    journalEntries: 5,
    habits: 8,
    medications: 3,
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    pendingSync: 3
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDownload, setShowDownload] = useState(false);
  const [autoDownload, setAutoDownload] = useState(true);
  const [storageUsed, setStorageUsed] = useState(24);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate loading
    setTimeout(() => setLoading(false), 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = () => {
    if (!isOnline) return;
    
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setOfflineData(prev => ({ ...prev, pendingSync: 0, lastSync: new Date() }));
    }, 3000);
  };

  const handleDownload = () => {
    setShowDownload(true);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowDownload(false), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {isOnline ? <Wifi className="w-8 h-8 text-green-500" /> : <WifiOff className="w-8 h-8 text-orange-500" />}
              {t('offlineMode.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('offlineMode.subtitle')}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
            isOnline 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></span>
            {isOnline ? t('offlineMode.online') : t('offlineMode.offline')}
          </div>
        </div>

        {/* Connection Status Card */}
        <div className={`glass-card p-6 ${
          isOnline 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
            : 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
        }`}>
          <div className="flex items-center gap-4">
            {isOnline ? (
              <>
                <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
                  <Wifi className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-green-800 dark:text-green-200">{t('offlineMode.youAreOnline')}</h3>
                  <p className="text-green-600 dark:text-green-400">{t('offlineMode.allFeatures')}</p>
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="btn-primary flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? t('offlineMode.syncing') : t('offlineMode.syncNow')}
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                  <WifiOff className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-orange-800 dark:text-orange-200">{t('offlineMode.youAreOffline')}</h3>
                  <p className="text-orange-600 dark:text-orange-400">{t('offlineMode.limitedFeatures')}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pending Sync Warning */}
        {offlineData.pendingSync > 0 && isOnline && (
          <div className="glass-card p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {offlineData.pendingSync} {t('offlineMode.pendingSync')}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {t('offlineMode.needsSync')}
                </p>
              </div>
              <button onClick={handleSync} className="btn-secondary text-sm">
                {t('offlineMode.syncNow')}
              </button>
            </div>
          </div>
        )}

        {/* Offline Data Overview */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            {t('offlineMode.availableData')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{offlineData.moodEntries}</p>
              <p className="text-sm text-gray-500">{t('offlineMode.moodEntries')}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{offlineData.journalEntries}</p>
              <p className="text-sm text-gray-500">{t('offlineMode.journalEntries')}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{offlineData.habits}</p>
              <p className="text-sm text-gray-500">{t('offlineMode.habits')}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">{offlineData.medications}</p>
              <p className="text-sm text-gray-500">{t('offlineMode.medications')}</p>
            </div>
          </div>
        </div>

        {/* Storage & Sync Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-gray-500" />
              {t('offlineMode.storageUsed')}
            </h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-sm font-semibold">{storageUsed} MB</span>
                <span className="text-sm text-gray-500">{t('offlineMode.ofStorage')}</span>
              </div>
              <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(storageUsed / 50) * 100}%` }}
                />
              </div>
            </div>
            <button className="btn-secondary w-full mt-4 text-sm">
              {t('offlineMode.clearCache')}
            </button>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              {t('offlineMode.lastSynced')}
            </h3>
            <p className="text-2xl font-bold mb-2">
              {offlineData.lastSync.toLocaleTimeString()}
            </p>
            <p className="text-gray-500">
              {offlineData.lastSync.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {offlineData.pendingSync > 0 && (
              <p className="text-sm text-orange-500 mt-2">
                {offlineData.pendingSync} {t('offlineMode.itemsPending')}
              </p>
            )}
          </div>
        </div>

        {/* Download for Offline */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-500" />
              {t('offlineMode.downloadTitle')}
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-500">{t('offlineMode.autoDownload')}</span>
              <input
                type="checkbox"
                checked={autoDownload}
                onChange={(e) => setAutoDownload(e.target.checked)}
                className="w-5 h-5"
              />
            </label>
          </div>
          
          <p className="text-gray-500 mb-4">
            {t('offlineMode.downloadDescription')}
          </p>

          <div className="space-y-3 mb-4">
            {[
              { label: t('offlineMode.moodHistory'), size: '2.4 MB', checked: true },
              { label: t('offlineMode.journalEntriesData'), size: '1.8 MB', checked: true },
              { label: t('offlineMode.habitTrackerData'), size: '0.5 MB', checked: true },
              { label: t('offlineMode.medicationSchedule'), size: '0.2 MB', checked: false }
            ].map((item, i) => (
              <label key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <span className="text-sm text-gray-500">{item.size}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleDownload}
            disabled={!isOnline}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {t('offlineMode.downloadData')}
          </button>
        </div>

        {/* Offline Features */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">{t('offlineMode.featuresTitle')}</h3>
          <div className="grid gap-3">
            {[
              { icon: Check, text: t('offlineMode.logMoods'), available: true },
              { icon: Check, text: t('offlineMode.writeJournal'), available: true },
              { icon: Check, text: t('offlineMode.trackHabits'), available: true },
              { icon: Check, text: t('offlineMode.viewMedication'), available: true },
              { icon: Check, text: t('offlineMode.accessCoping'), available: true },
              { icon: AlertTriangle, text: t('offlineMode.genAILimited'), available: false },
              { icon: AlertTriangle, text: t('offlineMode.communityReadOnly'), available: false }
            ].map((feature, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                feature.available 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}>
                <feature.icon className={`w-5 h-5 ${
                  feature.available ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className={feature.available ? '' : 'text-gray-500'}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Download Progress Modal */}
        <AnimatePresence>
          {showDownload && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="glass-card p-6 max-w-sm w-full text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {downloadProgress < 100 ? (
                  <>
                    <Download className="w-12 h-12 mx-auto mb-4 text-indigo-500 animate-bounce" />
                    <h3 className="text-xl font-semibold mb-2">{t('offlineMode.downloading')}</h3>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                      <motion.div
                        className="bg-indigo-500 h-3 rounded-full"
                        animate={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                    <p className="text-gray-500">{downloadProgress}%</p>
                  </>
                ) : (
                  <>
                    <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-xl font-semibold mb-2">{t('offlineMode.downloadComplete')}</h3>
                    <p className="text-gray-500">{t('offlineMode.dataAvailableOffline')}</p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default OfflineMode;
