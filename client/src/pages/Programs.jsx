import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  BookHeart,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  Heart,
  Moon,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp
} from 'lucide-react';

const STORAGE_KEY = 'mindcare_programs_hub_v1';

const calmProgramDays = [
  { day: 1, title: 'Nervous System Reset', focus: 'Box breathing plus a 10-minute walk', prompt: 'What is making your body feel on edge today?' },
  { day: 2, title: 'Reduce Mental Noise', focus: 'Single-task for 20 minutes and mute one distraction', prompt: 'What thought keeps repeating most often?' },
  { day: 3, title: 'Body Calm Check-In', focus: 'Stretch for 8 minutes and drink extra water', prompt: 'Where do you feel tension in your body?' },
  { day: 4, title: 'Compassion Day', focus: 'Replace one harsh thought with a kinder sentence', prompt: 'What would you say to a friend in your situation?' },
  { day: 5, title: 'Connection Anchor', focus: 'Reach out to one safe person', prompt: 'Who helps you feel more steady?' },
  { day: 6, title: 'Quiet Evening', focus: 'Use a lower-stimulation final hour before sleep', prompt: 'What calms you down fastest in the evening?' },
  { day: 7, title: 'Integrate and Repeat', focus: 'Review the week and pick two habits to keep', prompt: 'What worked well enough to repeat next week?' }
];

const sleepSprintDays = [
  { day: 1, title: 'Set a sleep window', action: 'Choose a realistic bedtime and wake time.' },
  { day: 2, title: 'Screen sunset', action: 'Stop scrolling at least 45 minutes before bed.' },
  { day: 3, title: 'Room reset', action: 'Make the room darker, quieter, and cooler.' },
  { day: 4, title: 'Gentle wind-down', action: 'Use reading, stretching, or journaling before sleep.' },
  { day: 5, title: 'Morning light', action: 'Get sunlight within the first hour after waking.' }
];

const confidenceExercises = [
  { key: 'microCourage', title: 'Do one brave small thing', description: 'Send the message, ask the question, or start the task.' },
  { key: 'evidenceLog', title: 'Collect evidence of progress', description: 'Write one fact that proves you are growing.' },
  { key: 'selfRespect', title: 'Speak to yourself with respect', description: 'Use a kinder tone for one difficult moment.' },
  { key: 'bodyLanguage', title: 'Practice grounded posture', description: 'Take three deep breaths and sit or stand taller.' }
];

const burnoutSymptoms = [
  'fatigue',
  'irritability',
  'brain fog',
  'numbness',
  'poor sleep',
  'overwhelm',
  'low motivation',
  'headaches'
];

const burnoutBoundaries = [
  { key: 'lunchBlock', title: 'Protect a real lunch break' },
  { key: 'focusWindow', title: 'Create one no-meeting focus block' },
  { key: 'delegateOne', title: 'Delegate or defer one non-essential task' },
  { key: 'phoneSunset', title: 'Stop work notifications after your finish time' },
  { key: 'protectedBedtime', title: 'Keep your bedtime protected tonight' }
];

const gratitudePrompts = [
  'What felt lighter today than it did last month?',
  'Who or what made you feel supported recently?',
  'What small comfort are you grateful for right now?',
  'What personal strength helped you get through today?',
  'What ordinary moment felt surprisingly good?'
];

const gratitudeCategories = [
  { value: 'small-win', label: 'Small Win' },
  { value: 'self', label: 'Self' },
  { value: 'people', label: 'People' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'growth', label: 'Growth' }
];

const createDefaultState = () => ({
  activeTab: 'calm',
  calm: {
    completed: Object.fromEntries(calmProgramDays.map((item) => [item.day, false])),
    notes: Object.fromEntries(calmProgramDays.map((item) => [item.day, '']))
  },
  sleep: {
    targetBedtime: '22:30',
    targetWake: '06:30',
    completed: Object.fromEntries(sleepSprintDays.map((item) => [item.day, false])),
    rituals: {
      screenOff: true,
      roomReset: false,
      caffeineCutoff: false,
      morningLight: true
    }
  },
  confidence: {
    wins: [{ id: 1, text: 'I kept showing up even when my energy was uneven.' }],
    draftWin: '',
    exercises: Object.fromEntries(confidenceExercises.map((item) => [item.key, false])),
    thought: '',
    reframe: ''
  },
  burnout: {
    energy: 48,
    workload: 72,
    symptoms: ['fatigue', 'overwhelm'],
    boundaries: Object.fromEntries(burnoutBoundaries.map((item) => [item.key, false])),
    notes: ''
  },
  gratitude: {
    draft: '',
    category: 'small-win',
    promptIndex: 0,
    entries: [
      { id: 1, text: 'I am learning to slow down without feeling guilty.', category: 'growth', createdAt: new Date().toISOString() },
      { id: 2, text: 'A calm cup of tea gave me a real pause today.', category: 'comfort', createdAt: new Date(Date.now() - 86400000).toISOString() }
    ]
  }
});

const mergeState = (savedState) => {
  const defaults = createDefaultState();

  if (!savedState || typeof savedState !== 'object') {
    return defaults;
  }

  return {
    ...defaults,
    ...savedState,
    calm: {
      ...defaults.calm,
      ...savedState.calm,
      completed: { ...defaults.calm.completed, ...(savedState.calm?.completed || {}) },
      notes: { ...defaults.calm.notes, ...(savedState.calm?.notes || {}) }
    },
    sleep: {
      ...defaults.sleep,
      ...savedState.sleep,
      completed: { ...defaults.sleep.completed, ...(savedState.sleep?.completed || {}) },
      rituals: { ...defaults.sleep.rituals, ...(savedState.sleep?.rituals || {}) }
    },
    confidence: {
      ...defaults.confidence,
      ...savedState.confidence,
      wins: Array.isArray(savedState.confidence?.wins) ? savedState.confidence.wins : defaults.confidence.wins,
      exercises: { ...defaults.confidence.exercises, ...(savedState.confidence?.exercises || {}) }
    },
    burnout: {
      ...defaults.burnout,
      ...savedState.burnout,
      symptoms: Array.isArray(savedState.burnout?.symptoms) ? savedState.burnout.symptoms : defaults.burnout.symptoms,
      boundaries: { ...defaults.burnout.boundaries, ...(savedState.burnout?.boundaries || {}) }
    },
    gratitude: {
      ...defaults.gratitude,
      ...savedState.gratitude,
      entries: Array.isArray(savedState.gratitude?.entries) ? savedState.gratitude.entries : defaults.gratitude.entries
    }
  };
};

const upcomingPrograms = [
  {
    title: 'Social Reset Week',
    description: 'Rebuild connection with gentle outreach goals and healthier social boundaries.'
  },
  {
    title: 'Overthinking Detox',
    description: 'Short daily practices for noticing loops, grounding faster, and simplifying decisions.'
  },
  {
    title: 'Digital Boundaries Bootcamp',
    description: 'Reduce doomscrolling with device rituals, app limits, and nervous-system breaks.'
  },
  {
    title: 'Self-Compassion Reset',
    description: 'Learn to answer stress with softer self-talk and realistic expectations.'
  },
  {
    title: 'Energy Rebuild Plan',
    description: 'Pair rest, movement, nutrition, and pacing habits to recover steady energy.'
  }
];

const SummaryCard = ({ icon: Icon, label, value, accent, detail }) => (
  <div className="glass-card p-5">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{detail}</p>
  </div>
);

const Programs = () => {
  const [programState, setProgramState] = useState(() => {
    if (typeof window === 'undefined') {
      return createDefaultState();
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return mergeState(raw ? JSON.parse(raw) : null);
    } catch {
      return createDefaultState();
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(programState));
  }, [programState]);

  const calmCompletedCount = Object.values(programState.calm.completed).filter(Boolean).length;
  const sleepCompletedCount = Object.values(programState.sleep.completed).filter(Boolean).length;
  const confidenceCompletedCount = Object.values(programState.confidence.exercises).filter(Boolean).length;
  const burnoutBoundaryCount = Object.values(programState.burnout.boundaries).filter(Boolean).length;
  const gratitudeCount = programState.gratitude.entries.length;
  const completedTrackableSteps = calmCompletedCount + sleepCompletedCount + confidenceCompletedCount + burnoutBoundaryCount;
  const totalTrackableSteps = calmProgramDays.length + sleepSprintDays.length + confidenceExercises.length + burnoutBoundaries.length;
  const overallProgress = Math.round((completedTrackableSteps / totalTrackableSteps) * 100);
  const confidenceMomentum = Math.min(100, confidenceCompletedCount * 18 + programState.confidence.wins.length * 9);
  const burnoutRisk = Math.max(
    8,
    Math.min(
      95,
      Math.round(
        programState.burnout.workload * 0.42 +
          (100 - programState.burnout.energy) * 0.33 +
          programState.burnout.symptoms.length * 4 -
          burnoutBoundaryCount * 5
      )
    )
  );

  const programTabs = [
    { key: 'calm', label: '7-Day Calm', icon: Sparkles, accent: 'from-sky-500 to-cyan-500' },
    { key: 'sleep', label: 'Sleep Repair', icon: Moon, accent: 'from-indigo-500 to-violet-500' },
    { key: 'confidence', label: 'Confidence', icon: Star, accent: 'from-amber-500 to-orange-500' },
    { key: 'burnout', label: 'Burnout Plan', icon: Flame, accent: 'from-rose-500 to-red-500' },
    { key: 'gratitude', label: 'Gratitude Wall', icon: Heart, accent: 'from-emerald-500 to-teal-500' }
  ];

  const currentPrompt = gratitudePrompts[programState.gratitude.promptIndex % gratitudePrompts.length];
  const burnoutRiskLabel = burnoutRisk >= 70 ? 'High risk' : burnoutRisk >= 45 ? 'Moderate risk' : 'Recovering';

  const setActiveTab = (tabKey) => {
    setProgramState((prev) => ({
      ...prev,
      activeTab: tabKey
    }));
  };

  const resetProgram = (tabKey) => {
    const defaults = createDefaultState();

    setProgramState((prev) => {
      if (tabKey === 'all') {
        return defaults;
      }

      return {
        ...prev,
        [tabKey]: defaults[tabKey]
      };
    });
  };

  const addConfidenceWin = () => {
    const trimmed = programState.confidence.draftWin.trim();

    if (!trimmed) {
      return;
    }

    setProgramState((prev) => ({
      ...prev,
      confidence: {
        ...prev.confidence,
        draftWin: '',
        wins: [{ id: Date.now(), text: trimmed }, ...prev.confidence.wins]
      }
    }));
  };

  const addGratitudeEntry = () => {
    const trimmed = programState.gratitude.draft.trim();

    if (!trimmed) {
      return;
    }

    setProgramState((prev) => ({
      ...prev,
      gratitude: {
        ...prev.gratitude,
        draft: '',
        promptIndex: (prev.gratitude.promptIndex + 1) % gratitudePrompts.length,
        entries: [
          {
            id: Date.now(),
            text: trimmed,
            category: prev.gratitude.category,
            createdAt: new Date().toISOString()
          },
          ...prev.gratitude.entries
        ]
      }
    }));
  };

  let activeSection = (
    <section className="glass-card p-6 md:p-8">
      <p className="text-gray-600 dark:text-gray-300">Choose a program above to begin.</p>
    </section>
  );

  if (programState.activeTab === 'calm') {
    const completion = Math.round((calmCompletedCount / calmProgramDays.length) * 100);

    activeSection = (
      <section className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sky-600 dark:text-sky-300 mb-2">Structured 7-day plan</p>
            <h2 className="text-2xl font-bold mb-2">7-Day Calm Program</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
              A nervous-system-friendly plan with one clear daily focus and one reflection prompt.
            </p>
          </div>
          <button
            type="button"
            onClick={() => resetProgram('calm')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset program
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{calmCompletedCount}/{calmProgramDays.length} days completed</span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {calmProgramDays.map((item) => {
            const completed = programState.calm.completed[item.day];

            return (
              <div
                key={item.day}
                className={`rounded-3xl border p-5 transition-all ${
                  completed
                    ? 'border-sky-200 bg-sky-50/80 dark:border-sky-500/30 dark:bg-sky-500/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300 mb-2">
                      <Calendar className="w-4 h-4" />
                      Day {item.day}
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setProgramState((prev) => ({
                        ...prev,
                        calm: {
                          ...prev.calm,
                          completed: {
                            ...prev.calm.completed,
                            [item.day]: !prev.calm.completed[item.day]
                          }
                        }
                      }))
                    }
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      completed ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {completed ? 'Completed' : 'Mark done'}
                  </button>
                </div>

                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="rounded-2xl bg-white/80 dark:bg-gray-900/40 p-4">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Focus</p>
                    <p>{item.focus}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 dark:bg-gray-900/40 p-4">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Reflection</p>
                    <p>{item.prompt}</p>
                  </div>
                  <textarea
                    value={programState.calm.notes[item.day]}
                    onChange={(event) =>
                      setProgramState((prev) => ({
                        ...prev,
                        calm: {
                          ...prev.calm,
                          notes: {
                            ...prev.calm.notes,
                            [item.day]: event.target.value
                          }
                        }
                      }))
                    }
                    rows={3}
                    placeholder="Write one sentence about how this day felt..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (programState.activeTab === 'sleep') {
    const completion = Math.round((sleepCompletedCount / sleepSprintDays.length) * 100);

    activeSection = (
      <section className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-2">Five-night sprint</p>
            <h2 className="text-2xl font-bold mb-2">Sleep Repair Sprint</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
              Use a short sprint to rebuild consistency around bedtime, wake time, and low-stimulation evenings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => resetProgram('sleep')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset sprint
          </button>
        </div>

        <div className="grid xl:grid-cols-[1.2fr,1fr] gap-6">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <label className="space-y-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Target bedtime</span>
                <input
                  type="time"
                  value={programState.sleep.targetBedtime}
                  onChange={(event) =>
                    setProgramState((prev) => ({
                      ...prev,
                      sleep: {
                        ...prev.sleep,
                        targetBedtime: event.target.value
                      }
                    }))
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Target wake time</span>
                <input
                  type="time"
                  value={programState.sleep.targetWake}
                  onChange={(event) =>
                    setProgramState((prev) => ({
                      ...prev,
                      sleep: {
                        ...prev.sleep,
                        targetWake: event.target.value
                      }
                    }))
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(programState.sleep.rituals).map(([key, enabled]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setProgramState((prev) => ({
                      ...prev,
                      sleep: {
                        ...prev.sleep,
                        rituals: {
                          ...prev.sleep.rituals,
                          [key]: !prev.sleep.rituals[key]
                        }
                      }
                    }))
                  }
                  className={`text-left rounded-2xl border px-4 py-4 transition-all ${
                    enabled
                      ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-500/10'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/30'
                  }`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {enabled ? 'Included in tonight’s routine' : 'Tap to include this ritual'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span>Night-by-night progress</span>
              <span>{completion}% complete</span>
            </div>
            <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${completion}%` }} />
            </div>
            <div className="space-y-3">
              {sleepSprintDays.map((item) => {
                const completed = programState.sleep.completed[item.day];

                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() =>
                      setProgramState((prev) => ({
                        ...prev,
                        sleep: {
                          ...prev.sleep,
                          completed: {
                            ...prev.sleep.completed,
                            [item.day]: !prev.sleep.completed[item.day]
                          }
                        }
                      }))
                    }
                    className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${
                      completed
                        ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-500/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300 mb-1">
                          Night {item.day}
                        </p>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.action}</p>
                      </div>
                      <CheckCircle className={`w-5 h-5 ${completed ? 'text-indigo-500' : 'text-gray-300 dark:text-gray-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (programState.activeTab === 'confidence') {
    activeSection = (
      <section className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-300 mb-2">Small wins, repeated</p>
            <h2 className="text-2xl font-bold mb-2">Confidence Builder</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
              Confidence grows from proof, not pressure. Complete small exercises and save evidence of progress.
            </p>
          </div>
          <button
            type="button"
            onClick={() => resetProgram('confidence')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset builder
          </button>
        </div>

        <div className="grid xl:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Confidence momentum</p>
                <p className="text-3xl font-bold">{confidenceMomentum}%</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              {confidenceExercises.map((item) => {
                const completed = programState.confidence.exercises[item.key];

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setProgramState((prev) => ({
                        ...prev,
                        confidence: {
                          ...prev.confidence,
                          exercises: {
                            ...prev.confidence.exercises,
                            [item.key]: !prev.confidence.exercises[item.key]
                          }
                        }
                      }))
                    }
                    className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${
                      completed
                        ? 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                      </div>
                      <CheckCircle className={`w-5 h-5 ${completed ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
              <h3 className="text-lg font-semibold mb-3">Thought reframe</h3>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Self-doubting thought</label>
              <textarea
                value={programState.confidence.thought}
                onChange={(event) =>
                  setProgramState((prev) => ({
                    ...prev,
                    confidence: {
                      ...prev.confidence,
                      thought: event.target.value
                    }
                  }))
                }
                rows={3}
                placeholder="I am not doing enough..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none mb-4"
              />
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Kinder reframe</label>
              <textarea
                value={programState.confidence.reframe}
                onChange={(event) =>
                  setProgramState((prev) => ({
                    ...prev,
                    confidence: {
                      ...prev.confidence,
                      reframe: event.target.value
                    }
                  }))
                }
                rows={3}
                placeholder="I am still learning, and showing up counts."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold">Wins log</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{programState.confidence.wins.length} saved</span>
              </div>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={programState.confidence.draftWin}
                  onChange={(event) =>
                    setProgramState((prev) => ({
                      ...prev,
                      confidence: {
                        ...prev.confidence,
                        draftWin: event.target.value
                      }
                    }))
                  }
                  placeholder="Add a win from today"
                  className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <button
                  type="button"
                  onClick={addConfidenceWin}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {programState.confidence.wins.map((win) => (
                  <div key={win.id} className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-4 py-3">
                    <p className="text-sm text-gray-700 dark:text-gray-200">{win.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (programState.activeTab === 'burnout') {
    activeSection = (
      <section className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-rose-600 dark:text-rose-300 mb-2">Recovery through pacing</p>
            <h2 className="text-2xl font-bold mb-2">Burnout Recovery Plan</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
              Track your risk, notice symptoms early, and choose a few boundaries that protect your energy this week.
            </p>
          </div>
          <button
            type="button"
            onClick={() => resetProgram('burnout')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset plan
          </button>
        </div>

        <div className="grid xl:grid-cols-[0.9fr,1.1fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current burnout risk</p>
                  <p className="text-3xl font-bold">{burnoutRisk}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">{burnoutRiskLabel}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{burnoutBoundaryCount} boundaries active</p>
                </div>
              </div>

              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Energy</label>
              <input
                type="range"
                min="0"
                max="100"
                value={programState.burnout.energy}
                onChange={(event) =>
                  setProgramState((prev) => ({
                    ...prev,
                    burnout: {
                      ...prev.burnout,
                      energy: Number(event.target.value)
                    }
                  }))
                }
                className="w-full accent-emerald-500 mb-4"
              />

              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Workload strain</label>
              <input
                type="range"
                min="0"
                max="100"
                value={programState.burnout.workload}
                onChange={(event) =>
                  setProgramState((prev) => ({
                    ...prev,
                    burnout: {
                      ...prev.burnout,
                      workload: Number(event.target.value)
                    }
                  }))
                }
                className="w-full accent-rose-500"
              />
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
              <h3 className="text-lg font-semibold mb-3">Symptoms check</h3>
              <div className="flex flex-wrap gap-3">
                {burnoutSymptoms.map((symptom) => {
                  const active = programState.burnout.symptoms.includes(symptom);

                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() =>
                        setProgramState((prev) => ({
                          ...prev,
                          burnout: {
                            ...prev.burnout,
                            symptoms: prev.burnout.symptoms.includes(symptom)
                              ? prev.burnout.symptoms.filter((item) => item !== symptom)
                              : [...prev.burnout.symptoms, symptom]
                          }
                        }))
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        active ? 'bg-rose-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
            <h3 className="text-lg font-semibold mb-4">Boundary builder</h3>
            <div className="grid md:grid-cols-2 gap-3 mb-5">
              {burnoutBoundaries.map((item) => {
                const active = programState.burnout.boundaries[item.key];

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setProgramState((prev) => ({
                        ...prev,
                        burnout: {
                          ...prev.burnout,
                          boundaries: {
                            ...prev.burnout.boundaries,
                            [item.key]: !prev.burnout.boundaries[item.key]
                          }
                        }
                      }))
                    }
                    className={`text-left rounded-2xl border px-4 py-4 transition-all ${
                      active
                        ? 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      <CheckCircle className={`w-5 h-5 ${active ? 'text-rose-500' : 'text-gray-300 dark:text-gray-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Recovery notes</label>
            <textarea
              value={programState.burnout.notes}
              onChange={(event) =>
                setProgramState((prev) => ({
                  ...prev,
                  burnout: {
                    ...prev.burnout,
                    notes: event.target.value
                  }
                }))
              }
              rows={5}
              placeholder="What is draining you most right now, and what would real recovery look like this week?"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>
      </section>
    );
  }

  if (programState.activeTab === 'gratitude') {
    activeSection = (
      <section className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300 mb-2">Daily reflection habit</p>
            <h2 className="text-2xl font-bold mb-2">Gratitude Wall</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
              Build an emotional memory of support, comfort, and progress by saving what felt meaningful.
            </p>
          </div>
          <button
            type="button"
            onClick={() => resetProgram('gratitude')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset wall
          </button>
        </div>

        <div className="grid xl:grid-cols-[0.85fr,1.15fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-3xl border border-emerald-200 dark:border-emerald-500/30 p-5 bg-emerald-50/80 dark:bg-emerald-500/10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Prompt of the moment</p>
                  <h3 className="text-xl font-semibold">{currentPrompt}</h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setProgramState((prev) => ({
                      ...prev,
                      gratitude: {
                        ...prev.gratitude,
                        promptIndex: (prev.gratitude.promptIndex + 1) % gratitudePrompts.length
                      }
                    }))
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-gray-900/40 text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Next
                </button>
              </div>
              <p className="text-sm text-emerald-800/80 dark:text-emerald-100/80">
                Keep it small and specific. Gratitude becomes more believable when it sounds like real life.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Category</label>
              <select
                value={programState.gratitude.category}
                onChange={(event) =>
                  setProgramState((prev) => ({
                    ...prev,
                    gratitude: {
                      ...prev.gratitude,
                      category: event.target.value
                    }
                  }))
                }
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none mb-4"
              >
                {gratitudeCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <textarea
                value={programState.gratitude.draft}
                onChange={(event) =>
                  setProgramState((prev) => ({
                    ...prev,
                    gratitude: {
                      ...prev.gratitude,
                      draft: event.target.value
                    }
                  }))
                }
                rows={4}
                placeholder="Write one thing you appreciate, even if it feels very small."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none mb-4"
              />

              <button
                type="button"
                onClick={addGratitudeEntry}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add to wall
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold">Saved gratitude cards</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{gratitudeCount} moments captured so far</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                <Heart className="w-4 h-4" />
                Gratitude wall
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 max-h-[30rem] overflow-y-auto pr-1">
              {programState.gratitude.entries.map((entry) => (
                <div key={entry.id} className="rounded-3xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-500/10 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      {gratitudeCategories.find((item) => item.value === entry.category)?.label || 'Entry'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <section className="glass-card p-6 md:p-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.12),_transparent_32%)] pointer-events-none" />
        <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-900/40 text-sm font-medium text-primary-700 dark:text-primary-300 mb-4">
              <BookHeart className="w-4 h-4" />
              Structured multi-day wellness plans
            </div>
            <h1 className="text-4xl font-bold mb-4">Programs</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              A guided hub for focused mental wellness journeys. Each program combines daily actions, reflection prompts,
              and saved progress so users can build momentum without guessing what to do next.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300">
                <Sparkles className="w-4 h-4" />
                5 live programs
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <Target className="w-4 h-4" />
                10 total program ideas
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300">
                <Clock className="w-4 h-4" />
                Progress saved locally
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 xl:w-[420px] w-full">
            <SummaryCard
              icon={TrendingUp}
              label="Overall progress"
              value={`${overallProgress}%`}
              accent="from-sky-500 to-cyan-500"
              detail={`${completedTrackableSteps} of ${totalTrackableSteps} guided actions completed`}
            />
            <SummaryCard
              icon={Moon}
              label="Sleep target"
              value={programState.sleep.targetBedtime}
              accent="from-indigo-500 to-violet-500"
              detail={`Wake plan ${programState.sleep.targetWake}`}
            />
            <SummaryCard
              icon={Flame}
              label="Burnout risk"
              value={`${burnoutRisk}%`}
              accent="from-rose-500 to-red-500"
              detail={`${burnoutRiskLabel} based on workload, energy, symptoms, and boundaries`}
            />
            <SummaryCard
              icon={Heart}
              label="Gratitude saved"
              value={gratitudeCount}
              accent="from-emerald-500 to-teal-500"
              detail={`${programState.confidence.wins.length} confidence wins are also logged`}
            />
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        {programTabs.map((tab) => {
          const isActive = programState.activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`text-left rounded-3xl border p-5 transition-all ${
                isActive
                  ? 'border-primary-200 bg-primary-50 dark:border-primary-500/30 dark:bg-primary-500/10 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 hover:border-primary-200 dark:hover:border-primary-500/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tab.accent} flex items-center justify-center shadow-lg mb-4`}>
                <tab.icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">{tab.label}</h2>
            </button>
          );
        })}
      </section>

      {activeSection}

      <section className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-300 mb-2">Next ideas</p>
            <h2 className="text-2xl font-bold">More program concepts</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              These five roadmap ideas bring the Programs hub to ten structured wellness plans.
            </p>
          </div>
          <button
            type="button"
            onClick={() => resetProgram('all')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset all saved progress
          </button>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
          {upcomingPrograms.map((program, index) => (
            <div key={program.title} className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-gray-800/60">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-4">
                <BarChart3 className="w-3.5 h-3.5" />
                Idea {index + 6}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{program.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-6">{program.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-5 border border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/10">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-300 mt-0.5" />
          <p className="text-sm text-amber-900 dark:text-amber-100 leading-6">
            These programs are supportive self-care tools, not emergency or medical treatment. If someone feels unsafe,
            the Emergency Support area should still be used right away.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Programs;
