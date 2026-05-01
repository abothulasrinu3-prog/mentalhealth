import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, Bell, Heart, Trash2, Settings, Mail, Check, X, Eye, Lock, AlertTriangle } from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const FamilySharing = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [shareSettings, setShareSettings] = useState({
    moodData: true,
    journalEntries: false,
    sleepData: true,
    medicationReminders: false,
    crisisAlerts: true,
    weeklyReports: true
  });

  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    const mockFamily = [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        relationship: 'Spouse',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b3ed30?w=100&h=100&fit=crop',
        status: 'active',
        permissions: {
          moodData: true,
          journalEntries: false,
          sleepData: true,
          crisisAlerts: true
        },
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 2,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        relationship: 'Brother',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        status: 'active',
        permissions: {
          moodData: true,
          journalEntries: false,
          sleepData: false,
          crisisAlerts: true
        },
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    const mockPending = [
      {
        id: 3,
        name: 'Emma Wilson',
        email: 'emma@example.com',
        relationship: 'Sister',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    setFamilyMembers(mockFamily);
    setPendingRequests(mockPending);
    setLoading(false);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    
    const newRequest = {
      id: Date.now(),
      email: inviteEmail,
      status: 'pending',
      invitedAt: new Date()
    };
    
    setPendingRequests([...pendingRequests, newRequest]);
    setInviteEmail('');
    setShowInvite(false);
  };

  const handleAcceptRequest = (request) => {
    const newMember = {
      id: request.id,
      name: request.name,
      email: request.email,
      relationship: request.relationship,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
      status: 'active',
      permissions: { ...shareSettings },
      lastActive: new Date()
    };
    
    setFamilyMembers([...familyMembers, newMember]);
    setPendingRequests(pendingRequests.filter(r => r.id !== request.id));
  };

  const handleRejectRequest = (id) => {
    setPendingRequests(pendingRequests.filter(r => r.id !== id));
  };

  const handleRemoveMember = (id) => {
    if (confirm('Remove this family member?')) {
      setFamilyMembers(familyMembers.filter(m => m.id !== id));
      setSelectedMember(null);
    }
  };

  const updatePermissions = (memberId, permissions) => {
    setFamilyMembers(familyMembers.map(m => 
      m.id === memberId ? { ...m, permissions } : m
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageExperience3D
        variant="family"
        eyebrow="Trusted support"
        title="Family Sharing"
        description="A more human sharing experience for trusted contacts, privacy controls, and care alerts."
        metrics={['Trusted circle', 'Privacy', 'Alerts']}
      />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8 text-pink-500" />
              Family Sharing
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Share your wellness journey with loved ones
            </p>
          </div>
          <motion.button
            onClick={() => setShowInvite(true)}
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus className="w-5 h-5" />
            Invite Family
          </motion.button>
        </div>

        {/* Privacy Notice */}
        <div className="glass-card p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-pink-800 dark:text-pink-200">Your Privacy Matters</h3>
              <p className="text-sm text-pink-700 dark:text-pink-300 mt-1">
                You control what you share. Family members only see what you allow them to see.
              </p>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{request.name || request.email}</p>
                    <p className="text-sm text-gray-500">{request.relationship || 'Family Member'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request)}
                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Family Members */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Your Family Circle</h2>
          
          {familyMembers.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No family members added yet</p>
              <button onClick={() => setShowInvite(true)} className="btn-primary mt-4">
                Invite your first family member
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {familyMembers.map((member) => (
                <motion.div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setSelectedMember(member)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {member.status}
                    </span>
                    <Settings className="w-5 h-5 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Default Share Settings */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Default Sharing Settings
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            These settings apply to new family members by default
          </p>
          <div className="space-y-3">
            {[
              { key: 'moodData', label: 'Mood Data', icon: Heart },
              { key: 'journalEntries', label: 'Journal Entries', icon: Lock },
              { key: 'sleepData', label: 'Sleep Data', icon: Heart },
              { key: 'medicationReminders', label: 'Medication Reminders', icon: Bell },
              { key: 'crisisAlerts', label: 'Crisis Alerts', icon: AlertTriangle },
              { key: 'weeklyReports', label: 'Weekly Reports', icon: Heart }
            ].map((setting) => (
              <label key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <setting.icon className="w-5 h-5 text-gray-500" />
                  <span>{setting.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={shareSettings[setting.key]}
                  onChange={(e) => setShareSettings({ ...shareSettings, [setting.key]: e.target.checked })}
                  className="w-5 h-5"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Invite Modal */}
        <AnimatePresence>
          {showInvite && (
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
                <h3 className="text-xl font-semibold mb-4">Invite Family Member</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="family@example.com"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleInvite} className="btn-primary flex-1">
                      Send Invite
                    </button>
                    <button onClick={() => setShowInvite(false)} className="btn-secondary flex-1">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Member Detail Modal */}
        <AnimatePresence>
          {selectedMember && (
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
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{selectedMember.name}</h3>
                    <p className="text-gray-500">{selectedMember.relationship}</p>
                  </div>
                </div>

                <h4 className="font-medium mb-3">Sharing Permissions</h4>
                <div className="space-y-2 mb-6">
                  {Object.entries(selectedMember.permissions).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => {
                          const newPermissions = { ...selectedMember.permissions, [key]: e.target.checked };
                          updatePermissions(selectedMember.id, newPermissions);
                        }}
                        className="w-4 h-4"
                      />
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleRemoveMember(selectedMember.id)}
                    className="btn-secondary flex-1 text-red-500 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </button>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="btn-primary flex-1"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default FamilySharing;
