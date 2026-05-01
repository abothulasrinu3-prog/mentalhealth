const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const round = (value, digits = 1) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const average = (values = []) => {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) return 0;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
};

const normalize = (value, max) => clamp((value / max) * 100, 0, 100);

const dictionaries = {
  themes: {
    workPressure: ['work', 'deadline', 'meeting', 'manager', 'exam', 'study', 'burnout'],
    relationships: ['friend', 'partner', 'family', 'relationship', 'alone', 'lonely', 'support'],
    sleepRecovery: ['sleep', 'rest', 'tired', 'awake', 'insomnia', 'night'],
    selfWorth: ['confidence', 'worth', 'failure', 'guilt', 'shame', 'insecure'],
    healthBody: ['health', 'pain', 'sick', 'doctor', 'medicine', 'body'],
    hopeGrowth: ['grateful', 'hope', 'progress', 'better', 'calm', 'proud'],
    overwhelm: ['overwhelmed', 'pressure', 'busy', 'panic', 'stuck', 'spiral'],
    focusEnergy: ['focus', 'energy', 'drained', 'motivation', 'distracted', 'screen']
  },
  triggers: {
    deadlines: ['deadline', 'exam', 'submission', 'assignment', 'target', 'meeting'],
    conflict: ['fight', 'argument', 'conflict', 'angry', 'frustrated', 'upset'],
    loneliness: ['alone', 'lonely', 'isolated', 'ignored', 'distance', 'empty'],
    sleepDebt: ['tired', 'insomnia', 'sleep', 'awake', 'restless', 'exhausted'],
    uncertainty: ['future', 'money', 'career', 'job', 'uncertain', 'fear', 'worry'],
    selfTalk: ['failure', 'guilt', 'shame', 'worthless', 'insecure', 'not enough']
  },
  protective: {
    connection: ['friend', 'family', 'support', 'talked', 'hug', 'together'],
    reflection: ['journal', 'reflect', 'learned', 'noticed', 'realized', 'processed'],
    calmRoutines: ['breathe', 'walk', 'meditate', 'rest', 'stretch', 'quiet'],
    hope: ['grateful', 'hope', 'progress', 'better', 'proud', 'thankful'],
    momentum: ['exercise', 'workout', 'run', 'focus', 'routine', 'discipline']
  }
};

const roadmapSeed = [
  {
    category: 'Awareness',
    description: 'Tracking and self-understanding modules.',
    items: [
      'Voice Mood Check-In',
      'Energy Tracker',
      'Trigger Tracker',
      'Emotion Vocabulary Coach',
      'Micro Journal Mode',
      'Stress Heatmap',
      'Social Battery Tracker',
      'Screen-Time Mood Correlation',
      'Weather and Mood Fusion',
      'Life Event Timeline'
    ]
  },
  {
    category: 'Recovery',
    description: 'Grounding and reset experiences.',
    items: [
      'Panic Mode',
      'Personal Coping Toolkit',
      'Sleep Ritual Builder',
      'Focus Reset Timer',
      'Recovery Playlist Suggestions',
      'Overwhelm Decompression Plan',
      'Body Scan Coach',
      'Grounding Card Deck',
      'Hydration Recovery Coach',
      'Quiet Evening Planner'
    ]
  },
  {
    category: 'AI Guidance',
    description: 'Personalized intelligence layers.',
    items: [
      'Weekly Wellness Report',
      'Burnout Risk Detector',
      'Tomorrow Mood Outlook',
      'Recovery Readiness Score',
      'Journal Theme Mining',
      'Adaptive Reflection Prompts',
      'Routine Coach',
      'AI Check-In Recap',
      'What-If Simulator',
      'Protective Factor Detector'
    ]
  },
  {
    category: 'Programs',
    description: 'Structured multi-day wellness plans.',
    items: [
      '7-Day Calm Program',
      'Sleep Repair Sprint',
      'Confidence Builder',
      'Burnout Recovery Plan',
      'Gratitude Wall',
      'Self-Compassion Course',
      'Anxiety Exposure Ladder',
      'Mood Lift Plan',
      'Study Stress Planner',
      'Workload Recovery Plan'
    ]
  },
  {
    category: 'Care Support',
    description: 'Features that strengthen care relationships.',
    items: [
      'Trusted Contact Circle',
      'Therapy Prep Notes',
      'Post-Therapy Reflection',
      'Crisis Signal Watch',
      'Check-In Sharing Cards',
      'Medication Impact Notes',
      'Relapse Warning Checklist',
      'Support Request Templates',
      'Care Team Summary Export',
      'Emergency Readiness Card'
    ]
  },
  {
    category: 'Lifestyle Intelligence',
    description: 'Wellness linked to routines and environment.',
    items: [
      'Nutrition and Mood Lens',
      'Movement Impact Analyzer',
      'Financial Stress Check-In',
      'Cycle-Aware Mood Layer',
      'Travel Recovery Planner',
      'Digital Detox Coach',
      'Morning Momentum Builder',
      'Weekend Reset Planner',
      'Low-Energy Meal Suggestions',
      'Burnout Prevention Alerts'
    ]
  }
].map((category) => ({
  ...category,
  items: category.items.map((title) => ({
    title,
    description: `${title} module ready to expand MindCare AI with a focused user workflow.`
  }))
}));

const getRiskLabel = (score) => {
  if (score >= 75) return 'high';
  if (score >= 45) return 'moderate';
  return 'low';
};

const toReadableLabel = (value = '') =>
  String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const getMoodLabelFromScore = (score) => {
  if (score >= 8.5) return 'very-happy';
  if (score >= 7) return 'happy';
  if (score >= 6) return 'calm';
  if (score >= 5) return 'neutral';
  if (score >= 4) return 'sad';
  if (score >= 3) return 'anxious';
  if (score >= 2) return 'angry';
  return 'exhausted';
};

const getCorpus = (moods = [], journals = []) => {
  const journalText = journals
    .map((journal) => [journal.title, journal.content, ...(journal.tags || [])].filter(Boolean).join(' '))
    .join(' ');
  const moodNotes = moods.map((entry) => entry.note).filter(Boolean).join(' ');
  return `${journalText} ${moodNotes}`.toLowerCase();
};

const countHits = (corpus, dictionary) =>
  Object.entries(dictionary)
    .map(([label, terms]) => ({
      label,
      count: terms.reduce((total, term) => total + (corpus.includes(term) ? 1 : 0), 0)
    }))
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count);

const getDailyTimeline = (moods = []) => {
  const grouped = moods.reduce((accumulator, mood) => {
    const date = new Date(mood.createdAt).toISOString().split('T')[0];
    if (!accumulator[date]) {
      accumulator[date] = { date, mood: [], stress: [], sleep: [], energy: [] };
    }
    accumulator[date].mood.push(mood.moodScore);
    if (Number.isFinite(mood.stressLevel)) accumulator[date].stress.push(mood.stressLevel);
    if (Number.isFinite(mood.sleepHours)) accumulator[date].sleep.push(mood.sleepHours);
    if (Number.isFinite(mood.energyLevel)) accumulator[date].energy.push(mood.energyLevel);
    return accumulator;
  }, {});

  return Object.values(grouped)
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((entry) => ({
      date: entry.date,
      mood: round(average(entry.mood)),
      stress: round(average(entry.stress)),
      sleep: round(average(entry.sleep)),
      energy: round(average(entry.energy))
    }));
};

export const buildAggregatedMetrics = (moods = []) => {
  const ordered = [...moods].sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
  const recent = ordered.slice(-7);
  const window = recent.length ? recent : ordered;

  const metrics = {
    totalEntries: moods.length,
    averageMood: round(average(window.map((entry) => entry.moodScore))),
    averageStress: round(average(window.map((entry) => entry.stressLevel))),
    averageSleep: round(average(window.map((entry) => entry.sleepHours))),
    averageExercise: round(average(window.map((entry) => entry.exerciseMinutes))),
    averageMeditation: round(average(window.map((entry) => entry.meditationMinutes))),
    averageWater: round(average(window.map((entry) => entry.waterIntake))),
    averageSocial: round(average(window.map((entry) => entry.socialInteraction))),
    averageEnergy: round(average(window.map((entry) => entry.energyLevel))),
    averageWorkHours: round(average(window.map((entry) => entry.workHours))),
    averageScreenTime: round(average(window.map((entry) => entry.screenTime))),
    sleepDebtHours: round(Math.max(0, 8 - average(window.map((entry) => entry.sleepHours))) * 7)
  };

  const midpoint = Math.max(1, Math.floor(window.length / 2));
  const firstHalf = window.slice(0, midpoint);
  const secondHalf = window.slice(midpoint);
  metrics.moodTrend = round(average(secondHalf.map((entry) => entry.moodScore)) - average(firstHalf.map((entry) => entry.moodScore)), 2);
  return metrics;
};

const buildSignals = (metrics, themeHits, triggerHits, protectiveHits) => {
  const signals = [];

  if (metrics.averageStress >= 7) {
    signals.push({
      title: 'Stress is carrying most of the current load',
      detail: `Recent stress is averaging ${metrics.averageStress}/10.`,
      direction: 'warning'
    });
  }

  if (metrics.averageSleep && metrics.averageSleep < 6.5) {
    signals.push({
      title: 'Sleep debt may be amplifying emotional swings',
      detail: `Recent sleep is around ${metrics.averageSleep} hours.`,
      direction: 'warning'
    });
  }

  if (protectiveHits[0]) {
    signals.push({
      title: `${protectiveHits[0].label} looks supportive right now`,
      detail: 'Your notes suggest this pattern appears around better days.',
      direction: 'positive'
    });
  }

  if (themeHits[0]) {
    signals.push({
      title: `${themeHits[0].label} is a recurring topic`,
      detail: 'This theme shows up enough to deserve direct attention.',
      direction: 'neutral'
    });
  }

  if (triggerHits[0]) {
    signals.push({
      title: `${triggerHits[0].label} may be a trigger cluster`,
      detail: 'Recent writing suggests this area is worth tracking closely.',
      direction: 'warning'
    });
  }

  return signals.slice(0, 4);
};

const buildActionPlan = (metrics, scores, triggerHits, protectiveHits) => [
  {
    title: 'Morning reset',
    timing: 'Morning',
    action: metrics.averageSleep < 7
      ? 'Start with water, daylight, and a lower-stimulation first 20 minutes.'
      : 'Anchor the day with a short walk, stretch, or breathing routine.'
  },
  {
    title: 'Pressure reduction',
    timing: 'Midday',
    action: scores.burnoutRisk >= 65
      ? `Reduce one avoidable task and shrink the ${triggerHits[0]?.label || 'overload'} pressure point.`
      : 'Protect one focused block and avoid stacking demanding tasks back to back.'
  },
  {
    title: 'Protective habit',
    timing: 'Afternoon',
    action: `Repeat the most supportive pattern you already show: ${(protectiveHits[0]?.label || 'calm routines').replace(/([A-Z])/g, ' $1').toLowerCase()}.`
  },
  {
    title: 'Evening recovery',
    timing: 'Evening',
    action: metrics.averageScreenTime > 7
      ? 'Use a lower-screen final hour and transition into reflection or stretching.'
      : 'Close the day with a short note on what helped and what drained you.'
  }
];

const buildExperiments = (metrics, scores) => {
  const experiments = [];
  if (metrics.averageSleep < 7) experiments.push({ title: 'Sleep stability experiment', successMetric: 'Average at least 7 hours for the next 3 nights.' });
  if (metrics.averageStress >= 6) experiments.push({ title: 'Stress interruption experiment', successMetric: 'Add two 5-minute resets during the highest-pressure block.' });
  if (metrics.averageExercise < 20) experiments.push({ title: 'Movement uplift experiment', successMetric: 'Complete 15 minutes of walking or stretching on 4 of the next 7 days.' });
  if (scores.recoveryReadiness < 55) experiments.push({ title: 'Recovery floor experiment', successMetric: 'Keep hydration, sleep, and one calming habit steady for 5 days.' });
  if (!experiments.length) experiments.push({ title: 'Momentum experiment', successMetric: 'Repeat the strongest routine from your best day this week.' });
  return experiments.slice(0, 3);
};

export const buildLocalModelInsights = (input) => {
  const sleep = input.sleep_hours ?? 7;
  const stress = input.stress_level ?? 5;
  const exercise = input.exercise_minutes ?? 15;
  const screen = input.screen_time ?? 4;
  const social = input.social_interaction ?? 5;
  const mood = input.mood_score ?? 5;
  const water = input.water_intake ?? 6;

  const overall = clamp(Math.round(
    45 + (mood / 10) * 20 + ((8 - Math.abs(8 - sleep)) / 8) * 12 + (exercise / 45) * 10 +
    (water / 8) * 6 + (social / 10) * 7 - (stress / 10) * 12 - Math.max(0, screen - 8) * 2
  ), 0, 100);

  const burnoutRisk = clamp(Math.round(
    normalize(stress, 10) * 0.42 +
    normalize(Math.max(0, 8 - sleep), 5) * 0.22 +
    normalize(Math.max(0, screen - 6), 8) * 0.08 +
    normalize(Math.max(0, 6 - mood), 5) * 0.18 +
    normalize(Math.max(0, 4 - social), 4) * 0.1
  ), 0, 100);

  const anxietyRisk = clamp(Math.round(
    normalize(stress, 10) * 0.48 +
    normalize(Math.max(0, 7 - sleep), 4) * 0.18 +
    normalize(screen, 12) * 0.12 +
    normalize(Math.max(0, 6 - mood), 5) * 0.16 +
    normalize(Math.max(0, 4 - social), 4) * 0.06
  ), 0, 100);

  const recoveryScore = clamp(Math.round(
    normalize(sleep, 8) * 0.3 +
    normalize(exercise, 45) * 0.18 +
    normalize(water, 8) * 0.12 +
    normalize(social, 10) * 0.16 +
    normalize(mood, 10) * 0.16 +
    normalize(Math.max(0, 10 - stress), 10) * 0.08
  ), 0, 100);

  const composite = Math.round(burnoutRisk * 0.45 + anxietyRisk * 0.35 + (100 - recoveryScore) * 0.2);
  const prediction = composite >= 70 ? 2 : composite >= 45 ? 1 : 0;
  const label = prediction === 2 ? 'high-risk' : prediction === 1 ? 'medium-risk' : 'low-risk';

  return {
    status: 'fallback',
    availableModels: ['heuristic-balance', 'heuristic-burnout', 'heuristic-anxiety'],
    ensemble: {
      prediction,
      label,
      confidence: clamp(58 + Math.round(Math.abs(composite - 50) * 0.45), 58, 89)
    },
    scores: {
      overall,
      burnoutRisk,
      anxietyRisk,
      recoveryScore,
      sleepDebt: round(Math.max(0, 8 - sleep), 1)
    },
    explanation: {
      strongestRiskFactors: [
        sleep < 6.5 ? 'sleep is below a steady recovery range' : null,
        stress >= 7 ? 'stress load is elevated' : null,
        mood <= 4.5 ? 'mood score is trending low' : null,
        screen >= 8 ? 'screen time is likely adding mental load' : null,
        social <= 4 ? 'social support looks limited' : null
      ].filter(Boolean),
      protectiveFactors: [
        sleep >= 7 ? 'sleep is within a healthier range' : null,
        exercise >= 20 ? 'movement is supporting recovery' : null,
        water >= 6 ? 'hydration is helping stability' : null,
        social >= 6 ? 'connection may be acting as a buffer' : null,
        mood >= 6 ? 'mood baseline is giving some resilience' : null
      ].filter(Boolean)
    },
    suggestions: [
      sleep < 6.5 ? { category: 'sleep', text: 'Aim for a lower-stimulation wind-down and 7-8 hours tonight.' } : null,
      stress >= 7 ? { category: 'stress', text: 'Protect two brief reset moments today to interrupt the stress cycle.' } : null,
      exercise < 20 ? { category: 'movement', text: 'Add 15-20 minutes of walking or stretching.' } : null,
      screen >= 8 ? { category: 'screen-balance', text: 'Use one screen-free block before bed or after work.' } : null,
      water < 6 ? { category: 'hydration', text: 'Keep water visible and target steady hydration through the day.' } : null
    ].filter(Boolean)
  };
};

export const buildInsightReport = ({ moods = [], journals = [], mlInsights = null, days = 30 }) => {
  const metrics = buildAggregatedMetrics(moods);
  const corpus = getCorpus(moods, journals);
  const themeHits = countHits(corpus, dictionaries.themes);
  const triggerHits = countHits(corpus, dictionaries.triggers);
  const protectiveHits = countHits(corpus, dictionaries.protective);
  const averageSentiment = round(average(journals.map((journal) => journal.sentimentScore)));
  const consistencyScore = clamp(Math.round((Math.min(moods.length, days) / Math.max(days, 1)) * 100), 0, 100);

  const burnoutRisk = clamp(Math.round(
    normalize(metrics.averageStress, 10) * 0.34 +
    normalize(Math.max(0, 8 - metrics.averageSleep), 5) * 0.2 +
    normalize(metrics.averageWorkHours, 12) * 0.16 +
    normalize(Math.max(0, 6 - metrics.averageMood), 5) * 0.16 +
    normalize(themeHits.find((theme) => theme.label === 'overwhelm')?.count || 0, 4) * 0.08 +
    normalize(Math.max(0, -averageSentiment), 1) * 0.06
  ), 0, 100);

  const anxietyLoad = clamp(Math.round(
    normalize(metrics.averageStress, 10) * 0.38 +
    normalize(Math.max(0, 7 - metrics.averageSleep), 4) * 0.16 +
    normalize(metrics.averageScreenTime, 12) * 0.12 +
    normalize(triggerHits.find((theme) => theme.label === 'uncertainty')?.count || 0, 4) * 0.14 +
    normalize(triggerHits.find((theme) => theme.label === 'selfTalk')?.count || 0, 4) * 0.12 +
    normalize(Math.max(0, 5 - metrics.averageMood), 4) * 0.08
  ), 0, 100);

  const recoveryReadiness = clamp(Math.round(
    normalize(metrics.averageSleep, 8) * 0.26 +
    normalize(metrics.averageExercise, 45) * 0.16 +
    normalize(metrics.averageMeditation, 20) * 0.14 +
    normalize(metrics.averageWater, 8) * 0.12 +
    normalize(metrics.averageSocial, 10) * 0.14 +
    normalize(Math.max(0, averageSentiment + 1), 2) * 0.08 +
    normalize(protectiveHits.length, 4) * 0.1
  ), 0, 100);

  const resilienceScore = clamp(Math.round(
    consistencyScore * 0.24 +
    normalize(metrics.averageMood, 10) * 0.18 +
    normalize(Math.max(0, 10 - metrics.averageStress), 10) * 0.14 +
    normalize(metrics.averageSleep, 8) * 0.14 +
    normalize(metrics.averageSocial, 10) * 0.1 +
    normalize(metrics.averageExercise, 45) * 0.1 +
    normalize(journals.length, Math.max(4, Math.floor(days / 5))) * 0.1
  ), 0, 100);

  const wellnessScore = clamp(Math.round(
    normalize(metrics.averageMood, 10) * 0.28 +
    normalize(Math.max(0, 10 - metrics.averageStress), 10) * 0.2 +
    normalize(metrics.averageSleep, 8) * 0.16 +
    normalize(metrics.averageExercise, 45) * 0.1 +
    normalize(metrics.averageWater, 8) * 0.08 +
    normalize(metrics.averageSocial, 10) * 0.08 +
    normalize(Math.max(0, averageSentiment + 1), 2) * 0.1
  ), 0, 100);

  const predictedMoodScore = clamp(round(
    metrics.averageMood - metrics.averageStress * 0.18 + (metrics.averageSleep - 7) * 0.24 +
    (metrics.averageExercise >= 20 ? 0.4 : -0.15) + (metrics.averageSocial - 5) * 0.08 +
    (metrics.averageEnergy - 5) * 0.08
  ), 1, 10);

  const ml = mlInsights || buildLocalModelInsights({
    sleep_hours: metrics.averageSleep || 7,
    stress_level: metrics.averageStress || 5,
    exercise_minutes: metrics.averageExercise || 15,
    screen_time: metrics.averageScreenTime || 4,
    social_interaction: metrics.averageSocial || 5,
    mood_score: metrics.averageMood || 5,
    water_intake: metrics.averageWater || 6
  });

  const scores = { wellnessScore, burnoutRisk, anxietyLoad, recoveryReadiness, resilienceScore, sleepDebtHours: metrics.sleepDebtHours };

  return {
    generatedAt: new Date().toISOString(),
    coverage: { days, moodEntries: moods.length, journalEntries: journals.length },
    summary: {
      averageMood: metrics.averageMood,
      averageStress: metrics.averageStress,
      averageSleep: metrics.averageSleep,
      averageEnergy: metrics.averageEnergy,
      averageSentiment,
      consistencyScore,
      moodTrend: metrics.moodTrend
    },
    scores: {
      ...scores,
      burnoutRiskLabel: getRiskLabel(scores.burnoutRisk),
      anxietyLoadLabel: getRiskLabel(scores.anxietyLoad),
      recoveryReadinessLabel: scores.recoveryReadiness >= 70 ? 'strong' : scores.recoveryReadiness >= 45 ? 'building' : 'fragile'
    },
    outlook: {
      tomorrowMoodScore: predictedMoodScore,
      tomorrowMoodLabel: getMoodLabelFromScore(predictedMoodScore),
      burnoutOutlook: getRiskLabel(scores.burnoutRisk),
      priorityFocus: triggerHits[0]?.label || themeHits[0]?.label || 'recovery'
    },
    signals: buildSignals(metrics, themeHits, triggerHits, protectiveHits),
    journalAnalysis: {
      topThemes: themeHits.slice(0, 4),
      topTriggers: triggerHits.slice(0, 4),
      protectiveFactors: protectiveHits.slice(0, 4)
    },
    actionPlan: buildActionPlan(metrics, scores, triggerHits, protectiveHits),
    experiments: buildExperiments(metrics, scores),
    ml,
    timeline: getDailyTimeline(moods)
  };
};

const getOutcomeDirection = ({ delta = 0, lowerIsBetter = false }) => {
  if (Math.abs(delta) < 0.2) return 'stable';
  if (lowerIsBetter) return delta < 0 ? 'improving' : 'declining';
  return delta > 0 ? 'improving' : 'declining';
};

const buildOutcomeLine = ({ id, label, baseline, current, lowerIsBetter = false, unit = '' }) => {
  const safeBaseline = Number.isFinite(baseline) ? baseline : 0;
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const delta = round(safeCurrent - safeBaseline, 2);
  const direction = getOutcomeDirection({ delta, lowerIsBetter });
  return {
    id,
    label,
    baseline: round(safeBaseline),
    current: round(safeCurrent),
    delta,
    unit,
    direction
  };
};

export const buildOutcomeSnapshot = ({ moods = [], journals = [], days = 30 }) => {
  const moodOrdered = [...moods].sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
  const journalOrdered = [...journals].sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));

  const midpointMood = Math.max(1, Math.floor(moodOrdered.length / 2));
  const midpointJournal = Math.max(1, Math.floor(journalOrdered.length / 2));
  const moodBaseline = moodOrdered.slice(0, midpointMood);
  const moodCurrent = moodOrdered.slice(midpointMood);
  const journalBaseline = journalOrdered.slice(0, midpointJournal);
  const journalCurrent = journalOrdered.slice(midpointJournal);

  const outcomes = [
    buildOutcomeLine({
      id: 'mood',
      label: 'Mood Score',
      baseline: average(moodBaseline.map((entry) => entry.moodScore)),
      current: average(moodCurrent.map((entry) => entry.moodScore)),
      unit: '/10'
    }),
    buildOutcomeLine({
      id: 'stress',
      label: 'Stress Load',
      baseline: average(moodBaseline.map((entry) => entry.stressLevel)),
      current: average(moodCurrent.map((entry) => entry.stressLevel)),
      lowerIsBetter: true,
      unit: '/10'
    }),
    buildOutcomeLine({
      id: 'sleep',
      label: 'Sleep Hours',
      baseline: average(moodBaseline.map((entry) => entry.sleepHours)),
      current: average(moodCurrent.map((entry) => entry.sleepHours)),
      unit: 'h'
    }),
    buildOutcomeLine({
      id: 'energy',
      label: 'Energy Level',
      baseline: average(moodBaseline.map((entry) => entry.energyLevel)),
      current: average(moodCurrent.map((entry) => entry.energyLevel)),
      unit: '/10'
    }),
    buildOutcomeLine({
      id: 'sentiment',
      label: 'Journal Sentiment',
      baseline: average(journalBaseline.map((entry) => entry.sentimentScore)),
      current: average(journalCurrent.map((entry) => entry.sentimentScore)),
      unit: ''
    })
  ];

  const improvingCount = outcomes.filter((item) => item.direction === 'improving').length;
  const decliningCount = outcomes.filter((item) => item.direction === 'declining').length;

  const momentumScore = clamp(
    Math.round(52 + improvingCount * 9 - decliningCount * 8 + normalize(Math.max(0, moods.length - 5), 20) * 0.12),
    0,
    100
  );

  return {
    generatedAt: new Date().toISOString(),
    coverage: {
      days,
      moodEntries: moods.length,
      journalEntries: journals.length
    },
    momentumScore,
    outcomes,
    wins: outcomes.filter((item) => item.direction === 'improving').map((item) => item.label).slice(0, 3),
    watchouts: outcomes.filter((item) => item.direction === 'declining').map((item) => item.label).slice(0, 3)
  };
};

const severityRank = { high: 3, medium: 2, low: 1 };

export const buildRiskAlerts = ({ moods = [], journals = [], report = null, days = 30 }) => {
  const compiledReport = report || buildInsightReport({ moods, journals, days });
  const alerts = [];
  const summary = compiledReport.summary || {};
  const scores = compiledReport.scores || {};
  const topTrigger = compiledReport.journalAnalysis?.topTriggers?.[0];
  const topProtective = compiledReport.journalAnalysis?.protectiveFactors?.[0];

  if (scores.burnoutRisk >= 70) {
    alerts.push({
      id: 'burnout-risk',
      severity: scores.burnoutRisk >= 82 ? 'high' : 'medium',
      score: scores.burnoutRisk,
      title: 'Burnout risk is elevated',
      detail: `Burnout risk is currently ${scores.burnoutRisk}/100. Consider reducing pressure load this week.`,
      action: 'Protect one non-negotiable recovery block and reduce one non-essential task.'
    });
  }

  if (scores.anxietyLoad >= 70) {
    alerts.push({
      id: 'anxiety-load',
      severity: scores.anxietyLoad >= 82 ? 'high' : 'medium',
      score: scores.anxietyLoad,
      title: 'Anxiety load is trending high',
      detail: `Anxiety load is ${scores.anxietyLoad}/100 and may affect sleep and focus.`,
      action: 'Run two 5-minute grounding resets before peak stress windows.'
    });
  }

  if (scores.recoveryReadiness <= 45) {
    alerts.push({
      id: 'recovery-readiness',
      severity: scores.recoveryReadiness <= 32 ? 'high' : 'medium',
      score: scores.recoveryReadiness,
      title: 'Recovery readiness looks fragile',
      detail: `Recovery readiness is ${scores.recoveryReadiness}/100 with sleep and stress imbalance.`,
      action: 'Prioritize consistent sleep timing and lower evening stimulation for 3 nights.'
    });
  }

  if (summary.moodTrend <= -0.8) {
    alerts.push({
      id: 'mood-drop',
      severity: summary.moodTrend <= -1.4 ? 'high' : 'medium',
      score: Math.abs(summary.moodTrend),
      title: 'Mood baseline is dropping',
      detail: `Mood trend moved ${summary.moodTrend} over the recent tracking window.`,
      action: 'Use a daily check-in and reach out to a trusted contact for early support.'
    });
  }

  if (summary.averageSleep > 0 && summary.averageSleep < 6.2) {
    alerts.push({
      id: 'sleep-debt',
      severity: summary.averageSleep < 5.6 ? 'high' : 'medium',
      score: summary.averageSleep,
      title: 'Sleep debt may be compounding symptoms',
      detail: `Average sleep is ${summary.averageSleep}h, below a steady recovery range.`,
      action: 'Keep wake time fixed and add a no-screen final 45-minute wind-down.'
    });
  }

  if (topTrigger?.count >= 2) {
    alerts.push({
      id: 'trigger-cluster',
      severity: topTrigger.count >= 4 ? 'medium' : 'low',
      score: topTrigger.count,
      title: `Repeated trigger cluster: ${toReadableLabel(topTrigger.label)}`,
      detail: `${toReadableLabel(topTrigger.label)} appears frequently in recent reflections.`,
      action: `Track this trigger daily and pair it with one protective action like ${toReadableLabel(topProtective?.label || 'calm routines')}.`
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    coverage: {
      days,
      moodEntries: moods.length,
      journalEntries: journals.length
    },
    alerts: alerts
      .sort((left, right) => (severityRank[right.severity] || 0) - (severityRank[left.severity] || 0))
      .slice(0, 6)
  };
};

export const buildTherapistBrief = ({ moods = [], journals = [], days = 30, report = null }) => {
  const compiledReport = report || buildInsightReport({ moods, journals, days });
  const outcomeSnapshot = buildOutcomeSnapshot({ moods, journals, days });
  const alerts = buildRiskAlerts({ moods, journals, report: compiledReport, days }).alerts;
  const topThemes = (compiledReport.journalAnalysis?.topThemes || []).slice(0, 4).map((item) => toReadableLabel(item.label));
  const topTriggers = (compiledReport.journalAnalysis?.topTriggers || []).slice(0, 4).map((item) => toReadableLabel(item.label));
  const protective = (compiledReport.journalAnalysis?.protectiveFactors || []).slice(0, 4).map((item) => toReadableLabel(item.label));

  const suggestedTalkingPoints = [
    `Priority focus to review: ${toReadableLabel(compiledReport.outlook?.priorityFocus || 'recovery')}.`,
    alerts[0] ? `Top active alert: ${alerts[0].title.toLowerCase()}.` : 'No critical alerts detected this period.',
    outcomeSnapshot.watchouts[0]
      ? `Outcome to stabilize: ${outcomeSnapshot.watchouts[0].toLowerCase()}.`
      : 'Outcome trend is generally stable.',
    topTriggers[0] ? `Most repeated trigger: ${topTriggers[0]}.` : 'No clear trigger cluster detected.',
    protective[0] ? `Most visible protective factor: ${protective[0]}.` : 'Protective factors need stronger consistency.'
  ];

  const journalHighlights = journals.slice(0, 3).map((entry) => ({
    id: String(entry._id),
    title: entry.title,
    date: entry.createdAt,
    moodTag: entry.moodTag || 'n/a',
    excerpt: String(entry.content || '').slice(0, 220)
  }));

  const summaryLines = [
    `MindCare Therapist Brief (${days}-day window)`,
    `Generated: ${new Date().toISOString()}`,
    `Mood entries: ${moods.length}, Journal entries: ${journals.length}`,
    `Average mood: ${compiledReport.summary?.averageMood || 0}/10`,
    `Average stress: ${compiledReport.summary?.averageStress || 0}/10`,
    `Average sleep: ${compiledReport.summary?.averageSleep || 0}h`,
    `Burnout risk: ${compiledReport.scores?.burnoutRisk || 0}/100`,
    `Anxiety load: ${compiledReport.scores?.anxietyLoad || 0}/100`,
    `Recovery readiness: ${compiledReport.scores?.recoveryReadiness || 0}/100`,
    `Top themes: ${topThemes.join(', ') || 'n/a'}`,
    `Top triggers: ${topTriggers.join(', ') || 'n/a'}`,
    `Protective factors: ${protective.join(', ') || 'n/a'}`,
    `Suggested talking points: ${suggestedTalkingPoints.join(' | ')}`
  ];

  return {
    generatedAt: new Date().toISOString(),
    coverage: {
      days,
      moodEntries: moods.length,
      journalEntries: journals.length
    },
    snapshot: {
      averageMood: compiledReport.summary?.averageMood || 0,
      averageStress: compiledReport.summary?.averageStress || 0,
      averageSleep: compiledReport.summary?.averageSleep || 0,
      moodTrend: compiledReport.summary?.moodTrend || 0,
      burnoutRisk: compiledReport.scores?.burnoutRisk || 0,
      anxietyLoad: compiledReport.scores?.anxietyLoad || 0,
      recoveryReadiness: compiledReport.scores?.recoveryReadiness || 0
    },
    themes: {
      topThemes,
      topTriggers,
      protective
    },
    alerts,
    outcomeSnapshot,
    suggestedTalkingPoints,
    journalHighlights,
    exportText: summaryLines.join('\n')
  };
};

export const buildRoadmapPayload = () => ({
  totalIdeas: roadmapSeed.reduce((sum, category) => sum + category.items.length, 0),
  categories: roadmapSeed.map((category) => ({
    ...category,
    count: category.items.length
  }))
});
