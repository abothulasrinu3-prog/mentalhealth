import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Eye, ScanFace, Shield, Check, X, AlertTriangle, Settings, Smartphone, Lock, Unlock, Key } from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const BiometricLogin = () => {
  const [isSupported, setIsSupported] = useState({
    fingerprint: false,
    face: false,
    iris: false
  });
  const [isEnrolled, setIsEnrolled] = useState({
    fingerprint: false,
    face: false,
    iris: false
  });
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);

  useEffect(() => {
    // Simulate checking biometric support
    setTimeout(() => {
      setIsSupported({
        fingerprint: true,
        face: true,
        iris: false
      });
      setIsEnrolled({
        fingerprint: true,
        face: false,
        iris: false
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleAuthenticate = (method) => {
    setAuthenticating(true);
    setSelectedMethod(method);
    
    // Simulate authentication
    setTimeout(() => {
      setAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        setAuthSuccess(null);
        setSelectedMethod(null);
      }, 2000);
    }, 2000);
  };

  const handleSetup = (method) => {
    setShowSetup(true);
    // Simulate setup process
    setTimeout(() => {
      setIsEnrolled(prev => ({ ...prev, [method]: true }));
      setShowSetup(false);
    }, 3000);
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'fingerprint': return Fingerprint;
      case 'face': return ScanFace;
      case 'iris': return Eye;
      default: return Key;
    }
  };

  const getMethodName = (method) => {
    switch (method) {
      case 'fingerprint': return 'Fingerprint';
      case 'face': return 'Face Recognition';
      case 'iris': return 'Iris Scan';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <PageExperience3D
          variant="biometric"
          eyebrow="Secure access"
          title="Biometric Login"
          description="A more tactile security setup experience with animated identity rings and local-device trust cues."
          metrics={['Device only', 'Fast unlock', 'Fallback ready']}
        />
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Fingerprint className="w-16 h-16 mx-auto mb-4 text-teal-500" />
          </motion.div>
          <h1 className="text-3xl font-bold">Biometric Login</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Secure your account with biometric authentication
          </p>
        </div>

        {/* Security Notice */}
        <div className="glass-card p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-teal-800 dark:text-teal-200">Your Biometric Data is Safe</h3>
              <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                Biometric data never leaves your device. It's stored securely in your device's secure enclave.
              </p>
            </div>
          </div>
        </div>

        {/* Available Methods */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Available Methods</h2>
          <div className="space-y-4">
            {['fingerprint', 'face', 'iris'].map((method) => {
              const Icon = getMethodIcon(method);
              const supported = isSupported[method];
              const enrolled = isEnrolled[method];

              return (
                <div
                  key={method}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    supported
                      ? enrolled
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        enrolled ? 'bg-teal-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">{getMethodName(method)}</p>
                        <p className="text-sm text-gray-500">
                          {!supported && 'Not supported on this device'}
                          {supported && !enrolled && 'Not set up'}
                          {supported && enrolled && 'Ready to use'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {enrolled && (
                        <motion.button
                          onClick={() => handleAuthenticate(method)}
                          disabled={authenticating}
                          className="btn-primary flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {authenticating && selectedMethod === method ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4" />
                              Test
                            </>
                          )}
                        </motion.button>
                      )}
                      {supported && !enrolled && (
                        <button
                          onClick={() => handleSetup(method)}
                          className="btn-secondary"
                        >
                          Set Up
                        </button>
                      )}
                      {!supported && (
                        <span className="text-gray-400">
                          <X className="w-5 h-5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            Settings
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-teal-500" />
                <div>
                  <p className="font-medium">Enable Biometric Login</p>
                  <p className="text-sm text-gray-500">Use biometrics instead of password</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => setBiometricEnabled(e.target.checked)}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">Fallback to Password</p>
                  <p className="text-sm text-gray-500">Allow password login if biometric fails</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={fallbackEnabled}
                onChange={(e) => setFallbackEnabled(e.target.checked)}
                className="w-5 h-5"
              />
            </label>
          </div>
        </div>

        {/* How It Works */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid gap-4">
            {[
              { step: 1, title: 'Enroll', desc: 'Set up your fingerprint or face in your device settings' },
              { step: 2, title: 'Authenticate', desc: 'Use your biometric to quickly and securely log in' },
              { step: 3, title: 'Stay Secure', desc: 'Your data never leaves your device' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 dark:text-teal-300 font-semibold">{item.step}</span>
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Tips */}
        <div className="glass-card p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Security Tips
          </h3>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
            <li>Biometric data is stored locally on your device only</li>
            <li>Enable fallback password for emergency access</li>
            <li>Disable biometric login if you share your device</li>
            <li>Your biometric is never shared with our servers</li>
          </ul>
        </div>

        {/* Setup Modal */}
        <AnimatePresence>
          {showSetup && (
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
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Fingerprint className="w-16 h-16 mx-auto mb-4 text-teal-500" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">Setting Up...</h3>
                <p className="text-gray-500 mb-4">
                  Place your finger on the sensor or look at the camera
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-teal-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {authSuccess && (
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-green-600">Authentication Successful!</h3>
                <p className="text-gray-500">Your identity has been verified</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default BiometricLogin;
