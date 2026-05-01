import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserCircle, Moon, Sun, Save, Loader2, Bell, Lock } from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    preferences: { notifications: true, dailyReminderTime: '09:00' }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        gender: user.gender || '',
        preferences: user.preferences || { notifications: true, dailyReminderTime: '09:00' }
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put(`${API_URL}/user/profile`, formData);
      updateUser(response.data.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_URL}/user/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageExperience3D
        variant="profile"
        eyebrow="Personal settings"
        title="Profile Tracker"
        description="A polished account hub for identity, preferences, privacy, and notification settings."
        metrics={['Profile', 'Theme', 'Privacy']}
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCircle className="w-8 h-8 text-primary-500" />
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 text-emerald-700' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Info */}
      <form onSubmit={handleProfileUpdate} className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Age (optional)</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="input-field"
              min="13"
              max="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Gender (optional)</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="input-field"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4 mt-6">Preferences</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Toggle dark/light theme</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <div>
                <p className="font-medium">Daily Reminders</p>
                <p className="text-sm text-gray-500">Get reminded to track your mood</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.preferences.notifications}
              onChange={(e) => setFormData({
                ...formData,
                preferences: { ...formData.preferences, notifications: e.target.checked }
              })}
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reminder Time</label>
            <input
              type="time"
              value={formData.preferences.dailyReminderTime}
              onChange={(e) => setFormData({
                ...formData,
                preferences: { ...formData.preferences, dailyReminderTime: e.target.value }
              })}
              className="input-field w-32"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </form>

      {/* Password Update */}
      <form onSubmit={handlePasswordUpdate} className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input-field"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-secondary flex items-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
          Update Password
        </button>
      </form>

      {/* Streak Info */}
      {user?.streak && (
        <div className="glass-card p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Your Streaks</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
              <p className="text-3xl font-bold text-orange-600">{user.streak.current}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
              <p className="text-3xl font-bold text-emerald-600">{user.streak.longest}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
