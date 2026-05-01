import { JournalEntry } from '../models/journal.model.js';
import { MoodEntry } from '../models/mood.model.js';
import { wellnessKnowledgeBase } from './wellness-knowledge.js';

const stopWords = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'from', 'have', 'your', 'about', 'into', 'been',
  'just', 'more', 'than', 'what', 'when', 'they', 'them', 'then', 'feel', 'feeling', 'very',
  'really', 'because', 'would', 'could', 'should', 'today', 'after', 'before', 'still', 'over',
  'under', 'their', 'there', 'where', 'while', 'which', 'were', 'being', 'need', 'want', 'please',
  'help', 'like', 'im', 'ive'
]);

const crisisPatterns = [
  /\bsuicid(e|al)\b/i,
  /\bkill myself\b/i,
  /\bend my life\b/i,
  /\bwant to die\b/i,
  /\bhurt myself\b/i,
  /\bself[\s-]?harm\b/i,
  /\boverdose\b/i,
  /\bbetter off dead\b/i,
  /\bend it all\b/i,
  /\bcan'?t go on\b/i,
  /\bnot safe\b/i
];

const MEMORY_TTL_MS = 1000 * 60 * 45;
const MAX_TURNS_PER_SESSION = 14;
const conversationMemory = new Map();

const safeAverage = (values) => {
  if (!values.length) return null;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
};

const tokenize = (value = '') =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));

const unique = (values = []) => [...new Set(values.filter(Boolean))];

const asSentence = (value = '') => {
  const cleaned = String(value || '').trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  if (/[.!?]$/.test(cleaned)) return cleaned;
  return `${cleaned}.`;
};

const extractTopTerms = (texts = [], limit = 6) => {
  const counts = new Map();

  texts
    .flatMap((text) => tokenize(text))
    .forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
};

const formatMoodLabel = (value = '') =>
  String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const scoreToBand = (value) => {
  if (value >= 78) return 'high';
  if (value >= 52) return 'moderate';
  return 'emerging';
};

const summarizeSignals = (context) => {
  const signals = [];

  if (context.averages.stressLevel !== null && context.averages.stressLevel >= 7) {
    signals.push('higher-than-usual stress');
  }

  if (context.averages.sleepHours !== null && context.averages.sleepHours < 6.5) {
    signals.push('short sleep');
  }

  if (context.averages.energyLevel !== null && context.averages.energyLevel <= 4.5) {
    signals.push('lower energy');
  }

  if (context.averages.moodScore !== null && context.averages.moodScore <= 4.5) {
    signals.push('low mood');
  }

  return signals;
};

const inferIntent = (message = '') => {
  const normalized = String(message || '').toLowerCase();
  const intentMap = {
    sleep: ['sleep', 'insomnia', 'night', 'bed', 'wake', 'tired'],
    stress: ['stress', 'pressure', 'panic', 'anxious', 'overwhelmed', 'tense'],
    burnout: ['burnout', 'drained', 'exhausted', 'fatigue', 'workload'],
    focus: ['focus', 'stuck', 'procrastination', 'distracted'],
    grounding: ['ground', 'spiral', 'dissociation', 'racing thoughts'],
    connection: ['alone', 'lonely', 'friend', 'support', 'family'],
    reflection: ['journal', 'reflect', 'thoughts', 'emotion'],
    safety: ['unsafe', 'harm', 'suicide', 'die']
  };

  const hits = Object.entries(intentMap)
    .map(([intent, terms]) => ({
      intent,
      score: terms.reduce((sum, term) => sum + (normalized.includes(term) ? 1 : 0), 0)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return hits.length ? hits[0].intent : 'support';
};

const normalizeMode = (mode = 'support') => {
  const raw = String(mode || 'support').toLowerCase().trim();
  if (raw === 'rag') return 'support';
  if (!raw) return 'support';
  return raw;
};

const getMemoryKey = ({ userId, sessionId = 'default' }) => `${String(userId)}::${String(sessionId)}`;

const pruneConversationMemory = () => {
  const now = Date.now();
  conversationMemory.forEach((record, key) => {
    if (!record?.updatedAt || now - record.updatedAt > MEMORY_TTL_MS) {
      conversationMemory.delete(key);
    }
  });
};

export const getConversationTurns = ({ userId, sessionId = 'default' }) => {
  pruneConversationMemory();
  const key = getMemoryKey({ userId, sessionId });
  return conversationMemory.get(key)?.turns || [];
};

export const appendConversationTurns = ({ userId, sessionId = 'default', turns = [] }) => {
  pruneConversationMemory();
  const key = getMemoryKey({ userId, sessionId });
  const existing = conversationMemory.get(key)?.turns || [];
  const normalizedTurns = turns
    .filter((turn) => turn?.role && turn?.content)
    .map((turn) => ({
      role: turn.role,
      content: String(turn.content).slice(0, 1200),
      at: turn.at || new Date().toISOString()
    }));

  const updatedTurns = [...existing, ...normalizedTurns].slice(-MAX_TURNS_PER_SESSION);
  conversationMemory.set(key, {
    turns: updatedTurns,
    updatedAt: Date.now()
  });

  return updatedTurns;
};

export const detectCrisisSignal = (message = '') => crisisPatterns.some((pattern) => pattern.test(message));

export const getUserWellnessContext = async (userId) => {
  const since = new Date();
  since.setDate(since.getDate() - 21);

  const [moods, journals] = await Promise.all([
    MoodEntry.find({ userId, createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(21).lean(),
    JournalEntry.find({ userId, createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(12).lean()
  ]);

  const averages = {
    moodScore: safeAverage(moods.map((entry) => entry.moodScore).filter((value) => Number.isFinite(value))),
    stressLevel: safeAverage(moods.map((entry) => entry.stressLevel).filter((value) => Number.isFinite(value))),
    sleepHours: safeAverage(moods.map((entry) => entry.sleepHours).filter((value) => Number.isFinite(value))),
    energyLevel: safeAverage(moods.map((entry) => entry.energyLevel).filter((value) => Number.isFinite(value)))
  };

  const dominantMoods = [...moods.reduce((map, entry) => {
    map.set(entry.moodLabel, (map.get(entry.moodLabel) || 0) + 1);
    return map;
  }, new Map()).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => formatMoodLabel(label));

  const themeTexts = journals.flatMap((entry) => [entry.title, entry.content, ...(entry.tags || [])].filter(Boolean));
  const topThemes = extractTopTerms(themeTexts);
  const topSignals = summarizeSignals({ averages });

  return {
    moods,
    journals,
    averages,
    dominantMoods,
    topThemes,
    topSignals,
    latestMood: moods[0]
      ? {
          label: formatMoodLabel(moods[0].moodLabel),
          moodScore: moods[0].moodScore,
          stressLevel: moods[0].stressLevel,
          sleepHours: moods[0].sleepHours
        }
      : null
  };
};

const buildSignalToCategoryMap = (signals = []) => {
  const categories = new Set();

  if (signals.includes('short sleep')) categories.add('sleep');
  if (signals.includes('higher-than-usual stress')) {
    categories.add('calming');
    categories.add('grounding');
  }
  if (signals.includes('lower energy')) categories.add('burnout');
  if (signals.includes('low mood')) {
    categories.add('connection');
    categories.add('mindset');
  }

  return categories;
};

const buildPersonalDocuments = (userContext) => {
  const journalDocs = (userContext.journals || []).slice(0, 6).map((entry, index) => ({
    id: `journal-${entry._id || index}`,
    title: `Journal reflection: ${entry.title || 'Untitled'}`,
    category: 'reflection',
    sourceType: 'user-journal',
    keywords: unique([...(entry.tags || []), entry.moodTag, 'journal', 'reflection'].flatMap((item) => tokenize(item))),
    content: [entry.title, entry.content, ...(entry.tags || [])].filter(Boolean).join(' ')
  }));

  const latestMood = userContext.latestMood;
  const moodDoc = latestMood
    ? [{
        id: `mood-${latestMood.label.toLowerCase().replace(/\s+/g, '-')}`,
        title: 'Recent mood snapshot',
        category: 'mood-pattern',
        sourceType: 'user-mood',
        keywords: unique([
          ...tokenize(latestMood.label),
          ...tokenize(userContext.topSignals.join(' ')),
          ...tokenize(userContext.topThemes.join(' '))
        ]),
        content: `Latest mood is ${latestMood.label}. Mood score ${latestMood.moodScore || 'n/a'}, stress ${latestMood.stressLevel || 'n/a'}, sleep ${latestMood.sleepHours || 'n/a'} hours.`
      }]
    : [];

  return [...journalDocs, ...moodDoc];
};

const getQueryProfile = ({ message = '', mode = 'support', userContext, conversationHistory = [] }) => {
  const normalizedMode = normalizeMode(mode);
  const detectedIntent = inferIntent(message);
  const recentHistoryText = conversationHistory.slice(-6).map((turn) => turn.content).join(' ');
  const queryTerms = unique([
    ...tokenize(message),
    ...tokenize(recentHistoryText),
    ...tokenize(userContext.topThemes.join(' ')),
    ...tokenize(userContext.dominantMoods.join(' ')),
    ...tokenize(userContext.topSignals.join(' ')),
    ...tokenize(detectedIntent),
    ...tokenize(normalizedMode)
  ]);

  return {
    normalizedMode,
    detectedIntent,
    queryTerms
  };
};

const scoreDocuments = ({ documents, queryProfile, userContext }) => {
  const corpusTerms = documents.map((doc) => unique([...(doc.keywords || []), ...tokenize(doc.content)]));
  const docFrequency = new Map();

  corpusTerms.forEach((terms) => {
    terms.forEach((term) => docFrequency.set(term, (docFrequency.get(term) || 0) + 1));
  });

  const signalCategories = buildSignalToCategoryMap(userContext.topSignals || []);

  return documents.map((doc, index) => {
    const terms = corpusTerms[index];
    const termsSet = new Set(terms);
    const lexicalScore = queryProfile.queryTerms.reduce((score, term) => {
      if (!termsSet.has(term)) return score;
      const idf = Math.log((documents.length + 1) / ((docFrequency.get(term) || 1) + 1)) + 1;
      return score + idf;
    }, 0);

    const modeBoost = doc.category === queryProfile.normalizedMode ? 2.4 : 0;
    const intentBoost = doc.category === queryProfile.detectedIntent ? 2.8 : 0;
    const signalBoost = signalCategories.has(doc.category) ? 2 : 0;
    const sourceBoost = doc.sourceType?.startsWith('user-') ? 0.7 : 1.1;
    const totalScore = Number((lexicalScore * sourceBoost + modeBoost + intentBoost + signalBoost).toFixed(3));

    const reasons = [];
    if (intentBoost > 0) reasons.push('intent-match');
    if (modeBoost > 0) reasons.push('mode-match');
    if (signalBoost > 0) reasons.push('signal-match');
    if (lexicalScore > 2.5) reasons.push('strong-lexical-overlap');

    return {
      ...doc,
      score: totalScore,
      reasons
    };
  });
};

export const retrieveKnowledge = ({ message = '', mode = 'support', userContext, conversationHistory = [] }) => {
  const queryProfile = getQueryProfile({ message, mode, userContext, conversationHistory });
  const libraryDocs = wellnessKnowledgeBase.map((doc) => ({
    ...doc,
    sourceType: 'knowledge-base'
  }));
  const personalDocs = buildPersonalDocuments(userContext);
  const allDocs = [...libraryDocs, ...personalDocs];

  const ranked = scoreDocuments({
    documents: allDocs,
    queryProfile,
    userContext
  }).sort((a, b) => b.score - a.score);

  const selected = ranked.slice(0, 5);
  const topScore = selected[0]?.score || 1;

  return selected.map((doc) => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    sourceType: doc.sourceType,
    confidence: Number((Math.max(0, Math.min(100, (doc.score / topScore) * 100))).toFixed(1)),
    reasons: doc.reasons,
    excerpt: `${String(doc.content || '').slice(0, 180).trim()}${String(doc.content || '').length > 180 ? '...' : ''}`
  }));
};

const buildObservationLine = (userContext) => {
  const pieces = [];

  if (userContext.averages.stressLevel !== null) {
    pieces.push(`average stress has been around ${userContext.averages.stressLevel}/10`);
  }

  if (userContext.averages.sleepHours !== null) {
    pieces.push(`sleep has averaged ${userContext.averages.sleepHours} hours`);
  }

  if (userContext.averages.moodScore !== null) {
    pieces.push(`mood has averaged ${userContext.averages.moodScore}/10`);
  }

  if (!pieces.length) {
    return 'I do not have much tracked history yet, so I am leaning more on your message and wellness guidance.';
  }

  return `From your recent check-ins, ${pieces.slice(0, 3).join(', ')}.`;
};

const summarizeContinuity = (conversationHistory = []) => {
  const recentUserTurn = [...conversationHistory].reverse().find((turn) => turn.role === 'user');
  if (!recentUserTurn?.content) return '';

  const terms = tokenize(recentUserTurn.content).slice(0, 4);
  if (!terms.length) return '';

  return `Last time, you mentioned ${terms.join(', ')}.`;
};

const buildActions = (documents = [], userContext) => {
  const categoryActions = documents.map((doc) => {
    if (doc.category === 'sleep') return 'Anchor your wake time tomorrow and reduce bright screens 60 minutes before bed.';
    if (doc.category === 'burnout') return 'Cut one non-essential task today and protect a true recovery break.';
    if (doc.category === 'gratitude') return 'Capture one believable small win from today in two sentences.';
    if (doc.category === 'focus') return 'Pick one ten-minute starter step and begin before checking notifications.';
    if (doc.category === 'connection') return 'Send one direct check-in message to a person who feels emotionally safe.';
    if (doc.category === 'grounding' || doc.category === 'calming') return 'Run three rounds of 4-in / 6-out breathing and unclench shoulders and jaw.';
    if (doc.category === 'reflection') return 'Write one short journal note naming emotion, trigger, and body response.';
    return null;
  }).filter(Boolean);

  const signalActions = [];
  if (userContext.topSignals.includes('short sleep')) {
    signalActions.push('Keep bedtime and wake-up times within a 30-minute window tonight and tomorrow.');
  }
  if (userContext.topSignals.includes('higher-than-usual stress')) {
    signalActions.push('Book two 5-minute reset blocks in your calendar before your highest-pressure period.');
  }

  return unique([...categoryActions, ...signalActions]).slice(0, 4);
};

const getRetrievalConfidence = (documents = []) => {
  if (!documents.length) return { score: 0, band: 'emerging' };
  const mean = documents.reduce((sum, doc) => sum + (doc.confidence || 0), 0) / documents.length;
  const rounded = Number(mean.toFixed(1));
  return {
    score: rounded,
    band: scoreToBand(rounded)
  };
};

export const generateRagResponse = ({
  message = '',
  mode = 'support',
  userContext,
  documents,
  conversationHistory = []
}) => {
  const crisisDetected = detectCrisisSignal(message);

  if (crisisDetected) {
    return {
      crisisDetected: true,
      reply:
        'I am concerned that you may be talking about immediate danger. The safest next step is to move toward live human support right now through emergency resources, a trusted person nearby, or the Emergency Support section in this app.',
      suggestedActions: [
        'Move away from being alone if you can.',
        'Contact emergency help or a trusted person right now.',
        'Open the Emergency Support page in the app and use it immediately.'
      ],
      sources: documents.length ? documents : retrieveKnowledge({ message, mode: 'safety', userContext, conversationHistory }),
      retrieval: getRetrievalConfidence(documents),
      reasoning: {
        intent: 'safety',
        mode: normalizeMode(mode),
        retrievalBand: 'high'
      }
    };
  }

  const normalizedMode = normalizeMode(mode);
  const introByMode = {
    support: 'I hear that this feels heavy right now.',
    sleep: 'Sleep disruption can make everything feel harder, so it makes sense this is affecting you.',
    stress: 'That sounds like a lot to carry at once.',
    grounding: 'Let us focus on making the moment feel steadier first.'
  };

  const observationLine = buildObservationLine(userContext);
  const continuityLine = summarizeContinuity(conversationHistory);
  const documentLine = documents.length
    ? `The strongest retrieved signals right now are ${documents.slice(0, 3).map((doc) => doc.title).join(', ')}.`
    : 'I am leaning on general wellness support guidance because I did not retrieve strong matches.';
  const followUp =
    userContext.topThemes.length > 0
      ? `Your recent reflections also point to themes like ${userContext.topThemes.slice(0, 3).join(', ')}.`
      : 'If you want, keep talking and I can help narrow this into one practical next step.';
  const retrieval = getRetrievalConfidence(documents);

  return {
    crisisDetected: false,
    reply: [introByMode[normalizedMode] || introByMode.support, continuityLine, observationLine, documentLine, followUp]
      .filter(Boolean)
      .map((line) => asSentence(line))
      .join(' '),
    suggestedActions: buildActions(documents, userContext),
    sources: documents,
    retrieval,
    contextSummary: {
      dominantMoods: userContext.dominantMoods,
      topThemes: userContext.topThemes,
      topSignals: userContext.topSignals
    },
    reasoning: {
      intent: inferIntent(message),
      mode: normalizedMode,
      retrievalBand: retrieval.band
    }
  };
};

export const generateCarePlan = ({ goal = '', days = 5, userContext }) => {
  const normalizedDays = Math.max(3, Math.min(10, Number(days) || 5));
  const primarySignal = userContext.topSignals[0] || 'stability';
  const theme = goal.trim() || primarySignal;
  const phaseTemplates = [
    {
      phase: 'Stabilize',
      action: 'Use 4-in / 6-out breathing for three rounds during your first stress spike.',
      checkIn: 'Score stress before and after the breathing reset.'
    },
    {
      phase: 'Reduce Load',
      action: 'Shrink one demanding task into a ten-minute starter step and stop after completion.',
      checkIn: 'Note whether task friction dropped after the first step.'
    },
    {
      phase: 'Recover',
      action: 'Protect one low-stimulation evening block and keep a consistent wake time.',
      checkIn: 'Log sleep quality and energy the next morning.'
    },
    {
      phase: 'Reconnect',
      action: 'Send one brief message to a safe person for connection or accountability.',
      checkIn: 'Rate loneliness and motivation after contact.'
    },
    {
      phase: 'Consolidate',
      action: 'Capture one concrete win and one challenge in a short journal reflection.',
      checkIn: 'Track whether stress, mood, or focus improved from day 1.'
    }
  ];

  const plan = Array.from({ length: normalizedDays }, (_, index) => {
    const template = phaseTemplates[index % phaseTemplates.length];
    return {
      day: index + 1,
      focus: `${theme} reset`,
      phase: template.phase,
      action: template.action,
      checkIn: template.checkIn,
      successMetric:
        index < normalizedDays - 1
          ? 'Progress means consistency, not perfection.'
          : 'If at least 3 days felt better, extend this for another week.'
    };
  });

  return {
    title: `${normalizedDays}-Day ${theme.replace(/\b\w/g, (char) => char.toUpperCase())} Plan`,
    summary: 'A generative care plan shaped by your tracked signals, journal themes, and recent mood patterns.',
    basedOn: {
      moods: userContext.dominantMoods,
      signals: userContext.topSignals,
      themes: userContext.topThemes.slice(0, 4)
    },
    days: plan
  };
};

export const generateVisualConcept = ({ mood = '', goal = '', aesthetic = 'calm', userContext }) => {
  const dominantMood = mood || userContext.dominantMoods[0] || 'Calm';
  const conceptGoal = goal || userContext.topSignals[0] || 'steady recovery';

  const paletteByMood = {
    Calm: ['#7dd3fc', '#2dd4bf', '#f8fafc'],
    Anxious: ['#60a5fa', '#14b8a6', '#e0f2fe'],
    Sad: ['#818cf8', '#93c5fd', '#e0e7ff'],
    Exhausted: ['#f59e0b', '#fb7185', '#fff7ed']
  };

  const palette = paletteByMood[dominantMood] || ['#38bdf8', '#34d399', '#f8fafc'];

  return {
    generatorType: 'gan-ready concept pack',
    conceptName: `${dominantMood} ${conceptGoal}`.trim(),
    intendedUse: 'background, affirmation card, or calming program cover',
    prompt:
      `Create a ${aesthetic} mental wellness visual centered on ${dominantMood.toLowerCase()} energy and ${conceptGoal}. Use soft gradients, supportive light, uncluttered composition, and a restorative atmosphere.`,
    negativePrompt:
      'graphic distress, chaotic noise, harsh contrast, crowded layout, threatening imagery, medical trauma imagery',
    palette,
    sceneElements: [
      'soft horizon light',
      'open breathing space',
      'gentle organic shapes',
      'quiet restorative environment'
    ],
    rationale: 'This concept uses mood profile and tracked wellness signals to keep visual direction emotionally supportive.',
    sourceSignals: {
      dominantMoods: userContext.dominantMoods,
      topSignals: userContext.topSignals
    }
  };
};

export const generateThoughtReframe = ({ thought = '', userContext }) => {
  const originalThought = String(thought || '').trim();
  const normalizedThought = originalThought.toLowerCase();
  const distortionRules = [
    {
      id: 'all-or-nothing',
      label: 'All-or-nothing thinking',
      pattern: /\b(always|never|completely|totally|nothing|everything)\b/i
    },
    {
      id: 'catastrophizing',
      label: 'Catastrophizing',
      pattern: /\b(disaster|ruined|hopeless|worst|impossible|cannot handle|can't handle)\b/i
    },
    {
      id: 'mind-reading',
      label: 'Mind reading',
      pattern: /\b(they think|everyone thinks|judging me|they hate me)\b/i
    },
    {
      id: 'fortune-telling',
      label: 'Fortune telling',
      pattern: /\b(i will fail|going to fail|won't work|no chance)\b/i
    },
    {
      id: 'self-blame',
      label: 'Self-blame',
      pattern: /\b(my fault|i am a failure|i'm a failure|i am worthless|i'm worthless|useless)\b/i
    }
  ];

  const matchedPatterns = distortionRules
    .filter((rule) => rule.pattern.test(normalizedThought))
    .map((rule) => ({
      id: rule.id,
      label: rule.label
    }));

  const fallbackPattern = matchedPatterns.length
    ? matchedPatterns
    : [{ id: 'emotional-reasoning', label: 'Emotion-based interpretation' }];

  const baseReframe = (() => {
    if (fallbackPattern.find((item) => item.id === 'self-blame')) {
      return 'This feels painful, but one moment does not define your value. You can respond with one small repair step.';
    }
    if (fallbackPattern.find((item) => item.id === 'catastrophizing')) {
      return 'This is hard right now, but it is likely temporary and more manageable when broken into smaller steps.';
    }
    if (fallbackPattern.find((item) => item.id === 'all-or-nothing')) {
      return 'Some parts are difficult, but not everything is failing. A partial win still counts as progress.';
    }
    if (fallbackPattern.find((item) => item.id === 'mind-reading')) {
      return 'You cannot fully know what others think. It can help to check facts before assuming the worst.';
    }
    return 'Your feeling is valid, and the story can still be updated with evidence, context, and one practical next step.';
  })();

  const contextualNudge = [];
  if (userContext?.topSignals?.includes('higher-than-usual stress')) {
    contextualNudge.push('Stress has been elevated, so your mind may be amplifying threat right now.');
  }
  if (userContext?.topSignals?.includes('short sleep')) {
    contextualNudge.push('Sleep debt can make negative interpretations feel more convincing than they actually are.');
  }
  if (Number.isFinite(userContext?.averages?.moodScore) && userContext.averages.moodScore <= 4.8) {
    contextualNudge.push('Recent low mood can narrow perspective, which does not mean the conclusion is fully accurate.');
  }

  const evidenceAgainst = [
    userContext?.topThemes?.[0]
      ? `Your recent reflections still show engagement with ${userContext.topThemes[0]}, which suggests capacity and effort are present.`
      : 'There are usually exceptions to this thought when you review your recent week in detail.',
    userContext?.dominantMoods?.[0]
      ? `Dominant mood recently has included ${userContext.dominantMoods[0]}, which can shift with routines and support.`
      : 'Mood states are dynamic, so this thought may not hold with the same intensity tomorrow.'
  ];

  const microActions = unique([
    'Write one sentence with evidence for the thought and one sentence with evidence against it.',
    'Replace global words like "always" or "never" with a specific timeframe such as "today" or "this week".',
    'Take 90 seconds of slower exhale breathing before deciding your next action.',
    userContext?.topSignals?.includes('short sleep')
      ? 'Protect a consistent wind-down tonight to reduce cognitive load tomorrow.'
      : null,
    userContext?.topSignals?.includes('higher-than-usual stress')
      ? 'Schedule two short reset blocks before your highest-pressure period.'
      : null
  ]).slice(0, 4);

  return {
    originalThought,
    detectedPatterns: fallbackPattern,
    balancedThought: `${baseReframe} ${contextualNudge.join(' ')}`.trim(),
    copingStatement: 'I can acknowledge this feeling without treating it as the full truth.',
    evidenceAgainst,
    microActions,
    journalPrompt:
      'What is one more balanced interpretation of this situation, and what is one action I can complete in the next 10 minutes?',
    contextSignals: {
      topSignals: userContext?.topSignals || [],
      topThemes: userContext?.topThemes || []
    }
  };
};

export const getGenAIStackSummary = () => ({
  genAI: 'enabled',
  rag: 'enabled',
  gan: 'gan-ready visual concept generation enabled',
  cbtReframer: 'enabled',
  conversationMemory: 'enabled (session-based, short-term)',
  retrievalPipeline: 'hybrid lexical scoring + intent + user-signal boosts',
  knowledgeDocuments: wellnessKnowledgeBase.length,
  dataSources: ['mood history', 'journal history', 'wellness knowledge base', 'conversation memory']
});
