import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BookOpen,
  Brain,
  Check,
  Clock,
  Droplets,
  Dumbbell,
  Edit3,
  HeartPulse,
  Mail,
  Moon,
  Pill,
  Plus,
  Sparkles,
  Send,
  Trash2,
  Waves,
  X
} from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOCAL_KEY = 'mindcare_smart_timetable';

const categories = [
  { id: 'study', label: 'Study', icon: BookOpen, color: '#2563eb' },
  { id: 'meditation', label: 'Meditation', icon: Brain, color: '#8b5cf6' },
  { id: 'workout', label: 'Workout', icon: Dumbbell, color: '#16a34a' },
  { id: 'sleep', label: 'Sleep', icon: Moon, color: '#4f46e5' },
  { id: 'medication', label: 'Medication', icon: Pill, color: '#dc2626' },
  { id: 'water', label: 'Water', icon: Droplets, color: '#0891b2' },
  { id: 'mood', label: 'Mood Log', icon: HeartPulse, color: '#db2777' },
  { id: 'therapy', label: 'Therapy', icon: Sparkles, color: '#7c3aed' },
  { id: 'affirmation', label: 'Affirmation', icon: Sparkles, color: '#f59e0b' },
  { id: 'breathing', label: 'Breathing', icon: Waves, color: '#0d9488' },
  { id: 'journal', label: 'Journal', icon: Edit3, color: '#64748b' },
  { id: 'other', label: 'Other', icon: Bell, color: '#475569' }
];

const days = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

const defaultForm = {
  title: '',
  category: 'meditation',
  time: '06:30',
  endTime: '07:00',
  timezone: 'Asia/Kolkata',
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  note: '',
  workingProblem: '',
  reminderEnabled: true,
  active: true
};

const createBlankSlot = (overrides = {}) => ({
  ...defaultForm,
  daysOfWeek: [...defaultForm.daysOfWeek],
  ...overrides
});

const toServerPayload = (item) => ({
  title: item.title,
  category: item.category,
  time: item.time,
  endTime: item.endTime || '',
  timezone: item.timezone || 'Asia/Kolkata',
  daysOfWeek: item.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
  note: item.note || '',
  workingProblem: item.workingProblem || '',
  reminderEnabled: item.reminderEnabled !== false,
  active: item.active !== false
});

const readLocalItems = (email) => {
  try {
    const allItems = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    return allItems[email] || [];
  } catch {
    return [];
  }
};

const writeLocalItems = (email, items) => {
  const allItems = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  allItems[email] = items;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(allItems));
};

const formatTime = (time) => {
  if (!time) {
    return '';
  }
  const [hourRaw, minute] = time.split(':');
  const hour = Number(hourRaw);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
};

const formatSlot = (item) => {
  if (!item.endTime || item.endTime <= item.time) {
    return formatTime(item.time);
  }

  return `${formatTime(item.time)} - ${formatTime(item.endTime)}`;
};

const getCategory = (id) => categories.find((category) => category.id === id) || categories.at(-1);

const getTodayValue = () => new Date().getDay();

const isSameLocalDay = (value, date = new Date()) => {
  if (!value) {
    return false;
  }

  const logDate = new Date(value);
  return logDate.toDateString() === date.toDateString();
};

const isCompletedToday = (item) =>
  (item.logs || []).some((log) => log.status === 'completed' && isSameLocalDay(log.createdAt));

const isNetworkFailure = (error) =>
  !error.response || error.response?.status === 404 || error.message === 'Network Error';

const isUnauthorized = (error) => error.response?.status === 401;

const getStoredToken = () => localStorage.getItem('token');

const applyStoredAuthHeader = () => {
  const token = getStoredToken();

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  }

  delete axios.defaults.headers.common['Authorization'];
  return false;
};

const SmartTimetable = () => {
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, remindersEnabled: 0, completed: 0, sent: 0 });
  const [emailStatus, setEmailStatus] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [formSlots, setFormSlots] = useState([createBlankSlot()]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sharing, setSharing] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);

  const userEmail = user?.email || 'demo@mindcare.local';

  const localSummary = (list) => ({
    total: list.length,
    active: list.filter((item) => item.active).length,
    remindersEnabled: list.filter((item) => item.active && item.reminderEnabled).length,
    completed: list.reduce((count, item) => count + (item.logs || []).filter((log) => log.status === 'completed').length, 0),
    sent: list.reduce((count, item) => count + (item.logs || []).filter((log) => log.status === 'sent').length, 0)
  });

  const reconnectBackendSession = async () => {
    try {
      applyStoredAuthHeader();
      const emailStatusResponse = await axios.get(`${API_URL}/timetable/email-status`);
      setEmailStatus(emailStatusResponse.data.data);
      setApiAvailable(true);
      return true;
    } catch (firstError) {
      if (!isUnauthorized(firstError) || !refreshUser) {
        setApiAvailable(false);
        return false;
      }
    }

    const refreshed = await refreshUser();
    if (!refreshed?.backend) {
      setApiAvailable(false);
      return false;
    }

    try {
      applyStoredAuthHeader();
      const emailStatusResponse = await axios.get(`${API_URL}/timetable/email-status`);
      setEmailStatus(emailStatusResponse.data.data);
      setApiAvailable(true);
      return true;
    } catch {
      setApiAvailable(false);
      return false;
    }
  };

  const ensureBackendSession = async () => {
    if (apiAvailable) {
      applyStoredAuthHeader();
      return true;
    }

    return reconnectBackendSession();
  };

  const loadTimetable = async (allowRetry = true) => {
    setLoading(true);
    try {
      const [itemsResponse, summaryResponse, emailStatusResponse] = await Promise.all([
        axios.get(`${API_URL}/timetable`),
        axios.get(`${API_URL}/timetable/summary`),
        axios.get(`${API_URL}/timetable/email-status`)
      ]);
      setItems(itemsResponse.data.data);
      setSummary(summaryResponse.data.data);
      setEmailStatus(emailStatusResponse.data.data);
      setApiAvailable(true);
      const synced = await syncLocalItemsToBackend(itemsResponse.data.data);
      if (synced) {
        setMessage('Your local timetable slots were synced to the backend. Automatic email reminders can now use them.');
        return loadTimetable(false);
      }
      setMessage('');
    } catch (error) {
      if (isUnauthorized(error)) {
        if (allowRetry && refreshUser) {
          const refreshed = await refreshUser();
          if (refreshed?.backend) {
            return loadTimetable(false);
          }
        }

        setApiAvailable(true);
        setMessage('Your session is still using local demo login. Refresh once or sign in again to use saved slots and email sending.');
        setItems([]);
        setSummary(localSummary([]));
        setEmailStatus(null);
        return;
      }

      const localItems = readLocalItems(userEmail);
      setItems(localItems);
      setSummary(localSummary(localItems));
      setEmailStatus(null);
      setApiAvailable(false);
      setMessage(
        isNetworkFailure(error)
          ? 'Using browser storage until the backend is available.'
          : (error.response?.data?.message || 'Could not load timetable from the server.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [userEmail]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.time.localeCompare(b.time)),
    [items]
  );

  const todaysItems = useMemo(
    () => sortedItems.filter((item) => item.active && item.daysOfWeek.includes(getTodayValue())),
    [sortedItems]
  );

  const pendingTodaysItems = useMemo(
    () => todaysItems.filter((item) => !isCompletedToday(item)),
    [todaysItems]
  );

  const nextItem = useMemo(() => {
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return pendingTodaysItems.find((item) => item.time >= current) || pendingTodaysItems[0];
  }, [pendingTodaysItems]);

  const saveLocal = (nextItems) => {
    setItems(nextItems);
    setSummary(localSummary(nextItems));
    writeLocalItems(userEmail, nextItems);
  };

  const syncLocalItemsToBackend = async (serverItems = []) => {
    const localItems = readLocalItems(userEmail);
    if (!localItems.length) {
      return false;
    }

    const existingKeys = new Set(
      serverItems.map((item) => `${item.title}::${item.time}::${item.endTime || ''}::${item.workingProblem || ''}`)
    );

    const unsyncedItems = localItems.filter((item) => {
      const key = `${item.title}::${item.time}::${item.endTime || ''}::${item.workingProblem || ''}`;
      return !existingKeys.has(key);
    });

    if (!unsyncedItems.length) {
      writeLocalItems(userEmail, []);
      return false;
    }

    await Promise.all(
      unsyncedItems.map((item) => axios.post(`${API_URL}/timetable`, toServerPayload(item)))
    );

    writeLocalItems(userEmail, []);
    return true;
  };

  const resetForm = () => {
    setForm(createBlankSlot());
    setFormSlots([createBlankSlot()]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payloads = editingId
      ? [{
          ...form,
          title: form.title.trim(),
          endTime: form.endTime,
          workingProblem: form.workingProblem.trim(),
          note: form.note.trim()
        }]
      : formSlots.map((slot) => ({
          ...slot,
          title: slot.title.trim(),
          endTime: slot.endTime,
          workingProblem: slot.workingProblem.trim(),
          note: slot.note.trim()
        })).filter((slot) => slot.title);

    if (!payloads.length) {
      setMessage('Add at least one activity name first.');
      return;
    }

    const canUseApi = await ensureBackendSession();

    if (canUseApi) {
      try {
        if (editingId) {
          await axios.put(`${API_URL}/timetable/${editingId}`, payloads[0]);
          setMessage('Timetable item updated.');
        } else {
          await Promise.all(payloads.map((payload) => axios.post(`${API_URL}/timetable`, payload)));
          setMessage(`${payloads.length} timetable slot${payloads.length === 1 ? '' : 's'} created.`);
        }
        resetForm();
        await loadTimetable();
        return;
      } catch (error) {
        if (isUnauthorized(error) && await reconnectBackendSession()) {
          return handleSubmit(event);
        }

        if (isUnauthorized(error)) {
          setMessage('Please sign in again to save timetable slots to your account and send emails.');
          return;
        }

        setApiAvailable(false);
        setMessage('Backend unavailable. Saved this timetable in browser storage.');
      }
    }

    const nextItems = editingId
      ? items.map((item) => (item._id === editingId ? { ...item, ...payloads[0] } : item))
      : [
          ...items,
          ...payloads.map((payload, index) => ({
            ...payload,
            _id: `local-${Date.now()}-${index}`,
            userEmail,
            logs: [],
            createdAt: new Date().toISOString()
          }))
        ];

    saveLocal(nextItems);
    resetForm();
  };

  const startEdit = (item) => {
    setForm({
      title: item.title,
      category: item.category,
      time: item.time,
      endTime: item.endTime || '',
      timezone: item.timezone || 'Asia/Kolkata',
      daysOfWeek: item.daysOfWeek,
      note: item.note || '',
      workingProblem: item.workingProblem || '',
      reminderEnabled: item.reminderEnabled,
      active: item.active
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const deleteItem = async (id) => {
    const canUseApi = await ensureBackendSession();

    if (canUseApi) {
      try {
        await axios.delete(`${API_URL}/timetable/${id}`);
        setMessage('Timetable item deleted.');
        await loadTimetable();
        return;
      } catch (error) {
        if (isUnauthorized(error) && await reconnectBackendSession()) {
          return deleteItem(id);
        }

        if (isUnauthorized(error)) {
          setMessage('Please sign in again to manage timetable slots from your account.');
          return;
        }

        setApiAvailable(false);
      }
    }

    saveLocal(items.filter((item) => item._id !== id));
  };

  const logStatus = async (id, status) => {
    const canUseApi = await ensureBackendSession();

    if (canUseApi) {
      try {
        await axios.patch(`${API_URL}/timetable/${id}/log`, { status });
        setMessage(status === 'completed' ? 'Activity completed.' : 'Activity skipped.');
        await loadTimetable();
        return;
      } catch (error) {
        if (isUnauthorized(error) && await reconnectBackendSession()) {
          return logStatus(id, status);
        }

        if (isUnauthorized(error)) {
          setMessage('Please sign in again to update timetable progress on the server.');
          return;
        }

        setApiAvailable(false);
      }
    }

    const nextItems = items.map((item) =>
      item._id === id
        ? {
            ...item,
            logs: [{ status, createdAt: new Date().toISOString() }, ...(item.logs || [])].slice(0, 60)
          }
        : item
    );
    saveLocal(nextItems);
  };

  const emailTimetable = async () => {
    if (!getStoredToken()) {
      setMessage('Please sign in to email your timetable.');
      return;
    }

    const canUseApi = await reconnectBackendSession();

    if (!canUseApi) {
      setMessage('Email sharing needs the backend server. Please start the server, sign in again, then try Email Timetable.');
      return;
    }

    setSharing(true);
    try {
      const synced = await syncLocalItemsToBackend(items);
      if (synced) {
        await loadTimetable(false);
      }

      const response = await axios.post(`${API_URL}/timetable/email-summary`);
      setMessage(response.data.message || `Timetable shared to ${userEmail}.`);
      await loadTimetable();
    } catch (error) {
      if (isUnauthorized(error) && await reconnectBackendSession()) {
        setSharing(false);
        return emailTimetable();
      }

      setMessage(
        isUnauthorized(error)
          ? 'Please sign in again to send timetable emails from your account.'
          : (error.response?.data?.message || 'Could not share timetable email right now.')
      );
    } finally {
      setSharing(false);
    }
  };

  const toggleDay = (day) => {
    setForm((current) => {
      const exists = current.daysOfWeek.includes(day);
      const nextDays = exists
        ? current.daysOfWeek.filter((item) => item !== day)
        : [...current.daysOfWeek, day].sort();
      return {
        ...current,
        daysOfWeek: nextDays.length ? nextDays : current.daysOfWeek
      };
    });
  };

  const updateFormSlot = (index, changes) => {
    setFormSlots((current) =>
      current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, ...changes } : slot))
    );
  };

  const addFormSlot = () => {
    setFormSlots((current) => {
      const lastSlot = current[current.length - 1] || createBlankSlot();
      return [
        ...current,
        createBlankSlot({
          category: lastSlot.category,
          timezone: lastSlot.timezone,
          daysOfWeek: [...lastSlot.daysOfWeek],
          reminderEnabled: lastSlot.reminderEnabled,
          active: lastSlot.active
        })
      ];
    });
  };

  const removeFormSlot = (index) => {
    setFormSlots((current) => current.length === 1 ? current : current.filter((_, slotIndex) => slotIndex !== index));
  };

  const toggleSlotDay = (slotIndex, day) => {
    setFormSlots((current) =>
      current.map((slot, index) => {
        if (index !== slotIndex) {
          return slot;
        }

        const exists = slot.daysOfWeek.includes(day);
        const nextDays = exists
          ? slot.daysOfWeek.filter((item) => item !== day)
          : [...slot.daysOfWeek, day].sort();

        return {
          ...slot,
          daysOfWeek: nextDays.length ? nextDays : slot.daysOfWeek
        };
      })
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageExperience3D
        variant="habit"
        eyebrow="Smart routine engine"
        title="Smart Timetable"
        description="Plan study, care, rest, hydration, medicine, breathing, and therapy reminders in one protected wellness schedule."
        metrics={['Time slots', 'Email sharing', 'Routine focus']}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Clock className="h-8 w-8 text-primary-500" />
            MindCare AI Timetable
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Personalized wellness and productivity reminders for {user?.name || 'your day'}.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={emailTimetable}
            disabled={sharing || sortedItems.length === 0}
            className="btn-secondary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-5 w-5" />
            {sharing ? 'Sharing...' : 'Email Timetable'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm((value) => !value);
              setEditingId(null);
              setForm(createBlankSlot());
              setFormSlots([createBlankSlot()]);
            }}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Slot
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800 dark:border-sky-900/50 dark:bg-sky-900/20 dark:text-sky-200">
          {message}
        </div>
      )}

      {emailStatus && !emailStatus.smtpConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          SMTP is not fully configured yet. Add values for {emailStatus.missingFields.join(', ')} in `server/.env` to enable automatic email sending.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Total', summary.total, Bell],
          ['Active', summary.active, Check],
          ['Email reminders', summary.remindersEnabled, Clock],
          ['Completed logs', summary.completed, HeartPulse],
          ['Emails sent', summary.sent, Sparkles]
        ].map(([label, value, Icon]) => (
          <div key={label} className="glass-card p-5">
            <div className="mb-3 flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Icon className="h-5 w-5 text-primary-500" />
              <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      {nextItem && (
        <div className="glass-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
              Next for today
            </p>
            <h2 className="mt-1 text-2xl font-bold">{nextItem.title}</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {formatSlot(nextItem)}
            </p>
            {nextItem.workingProblem && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Working problem: {nextItem.workingProblem}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => logStatus(nextItem._id, 'completed')} className="btn-primary px-4 py-2">
              Done
            </button>
            <button onClick={() => logStatus(nextItem._id, 'skipped')} className="btn-secondary px-4 py-2">
              Skip
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            className="glass-card p-6"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Time Slot' : 'Create Time Slot'}</h3>
              <button type="button" onClick={resetForm} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {editingId ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Activity name</label>
                  <input
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    className="input-field"
                    placeholder="Morning meditation"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Start time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(event) => setForm({ ...form, time: event.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">End time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Category</label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="input-field"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Timezone</label>
                  <input
                    value={form.timezone}
                    onChange={(event) => setForm({ ...form, timezone: event.target.value })}
                    className="input-field"
                    placeholder="Asia/Kolkata"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Working problem</label>
                  <textarea
                    value={form.workingProblem}
                    onChange={(event) => setForm({ ...form, workingProblem: event.target.value })}
                    className="input-field min-h-[88px]"
                    placeholder="Example: Finish DBMS assignment, reduce screen stress, revise anxiety coping notes."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Reminder days</label>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          form.daysOfWeek.includes(day.value)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Personal note</label>
                  <textarea
                    value={form.note}
                    onChange={(event) => setForm({ ...form, note: event.target.value })}
                    className="input-field min-h-[96px]"
                    placeholder="Taking a few minutes to relax can improve focus and reduce stress."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {formSlots.map((slot, index) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h4 className="font-semibold">Slot {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeFormSlot(index)}
                        disabled={formSlots.length === 1}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-900/20"
                        aria-label="Remove slot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-4">
                      <div className="lg:col-span-2">
                        <label className="mb-2 block text-sm font-medium">Activity name</label>
                        <input
                          value={slot.title}
                          onChange={(event) => updateFormSlot(index, { title: event.target.value })}
                          className="input-field"
                          placeholder="Study, meditation, workout"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Start time</label>
                        <input
                          type="time"
                          value={slot.time}
                          onChange={(event) => updateFormSlot(index, { time: event.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">End time</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(event) => updateFormSlot(index, { endTime: event.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Category</label>
                        <select
                          value={slot.category}
                          onChange={(event) => updateFormSlot(index, { category: event.target.value })}
                          className="input-field"
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Timezone</label>
                        <input
                          value={slot.timezone}
                          onChange={(event) => updateFormSlot(index, { timezone: event.target.value })}
                          className="input-field"
                          placeholder="Asia/Kolkata"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="mb-2 block text-sm font-medium">Working problem</label>
                        <input
                          value={slot.workingProblem}
                          onChange={(event) => updateFormSlot(index, { workingProblem: event.target.value })}
                          className="input-field"
                          placeholder="Finish DBMS assignment"
                        />
                      </div>
                      <div className="lg:col-span-4">
                        <label className="mb-2 block text-sm font-medium">Personal note</label>
                        <textarea
                          value={slot.note}
                          onChange={(event) => updateFormSlot(index, { note: event.target.value })}
                          className="input-field min-h-[74px]"
                          placeholder="Add a small reminder message for this slot."
                        />
                      </div>
                      <div className="lg:col-span-4">
                        <label className="mb-2 block text-sm font-medium">Reminder days</label>
                        <div className="flex flex-wrap gap-2">
                          {days.map((day) => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => toggleSlotDay(index, day.value)}
                              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                                slot.daysOfWeek.includes(day.value)
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                              }`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 lg:col-span-4">
                        <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium dark:border-gray-700">
                          <input
                            type="checkbox"
                            checked={slot.reminderEnabled}
                            onChange={(event) => updateFormSlot(index, { reminderEnabled: event.target.checked })}
                          />
                          Email reminder
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium dark:border-gray-700">
                          <input
                            type="checkbox"
                            checked={slot.active}
                            onChange={(event) => updateFormSlot(index, { active: event.target.checked })}
                          />
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addFormSlot}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add another slot
                </button>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800 dark:border-sky-900/50 dark:bg-sky-900/20 dark:text-sky-200">
                <Mail className="h-4 w-4" />
                Sends to {userEmail}
              </div>
              {editingId && (
                <>
                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium dark:border-gray-700">
                    <input
                      type="checkbox"
                      checked={form.reminderEnabled}
                      onChange={(event) => setForm({ ...form, reminderEnabled: event.target.checked })}
                    />
                    Email reminder
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium dark:border-gray-700">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(event) => setForm({ ...form, active: event.target.checked })}
                    />
                    Active
                  </label>
                </>
              )}
              <button type="submit" className="btn-primary">
                {editingId ? 'Save Changes' : `Create ${formSlots.filter((slot) => slot.title.trim()).length || formSlots.length} Slots`}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="glass-card p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold">Your Daily Schedule</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4 text-primary-500" />
            Email target: {userEmail}
          </div>
        </div>
        {sortedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">
            Add your first time slot with a working problem and email reminder.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => {
              const category = getCategory(item.category);
              const CategoryIcon = category.icon;
              const completedCount = (item.logs || []).filter((log) => log.status === 'completed').length;

              return (
                <motion.div
                  key={item._id}
                  className={`rounded-xl border p-4 transition ${
                    item.active
                      ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                      : 'border-gray-200 bg-gray-50 opacity-70 dark:border-gray-700 dark:bg-gray-800/60'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div
                        className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl"
                        style={{ backgroundColor: `${category.color}22`, color: category.color }}
                      >
                        <CategoryIcon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold">{item.title}</h4>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {category.label}
                          </span>
                          {item.reminderEnabled && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                              Email on
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {formatSlot(item)} - {days.filter((day) => item.daysOfWeek.includes(day.value)).map((day) => day.label).join(', ')}
                        </p>
                        {item.workingProblem && (
                          <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Working problem: {item.workingProblem}
                          </p>
                        )}
                        {item.note && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.note}</p>}
                        <p className="mt-2 text-xs text-gray-500">
                          {completedCount} completions - Last reminder: {item.lastReminderSentKey || 'not sent yet'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => logStatus(item._id, 'completed')} className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" aria-label="Mark complete">
                        <Check className="h-5 w-5" />
                      </button>
                      <button onClick={() => startEdit(item)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" aria-label="Edit">
                        <Edit3 className="h-5 w-5" />
                      </button>
                      <button onClick={() => deleteItem(item._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Delete">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartTimetable;
