import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Heart,
  Palette,
  RefreshCw,
  Send,
  Shield,
  Sparkles,
  User,
  Wand2
} from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const modeConfig = {
  support: {
    label: 'Support Chat',
    icon: Bot,
    description: 'Generative emotional support shaped by your wellness history.'
  },
  rag: {
    label: 'RAG Coach',
    icon: BookOpen,
    description: 'Retrieval-backed guidance using your data and the in-app wellness knowledge base.'
  },
  carePlan: {
    label: 'Care Plan',
    icon: Brain,
    description: 'Generate a short multi-day wellness plan from current goals and patterns.'
  },
  visual: {
    label: 'Visual Studio',
    icon: Palette,
    description: 'Create GAN-ready concept packs for calming visual assets and covers.'
  }
};

const quickPromptsByMode = {
  support: [
    "I'm feeling anxious today",
    "I feel emotionally tired",
    "I need help slowing down",
    "I'm stressed about work"
  ],
  rag: [
    'Use my recent history to guide me',
    'What do my stress and sleep trends suggest?',
    'Help me with burnout recovery',
    'What theme do you see in my journal patterns?'
  ]
};

const stackAccent = {
  enabled: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  ready: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
};

const initialMessages = [
  {
    id: 1,
    type: 'bot',
    text: 'MindCare GenAI is ready. You can chat for support, use retrieval-backed RAG guidance, generate a care plan, or create a GAN-ready visual concept pack.',
    timestamp: new Date()
  }
];

const fallbackStack = {
  genAI: 'local fallback enabled',
  rag: 'backend connection needed',
  gan: 'local concept-pack fallback enabled',
  knowledgeDocuments: 0
};

const toTitleCase = (value = '') => value.replace(/\b\w/g, (character) => character.toUpperCase());

const buildLocalCarePlan = ({ goal, days }) => {
  const normalizedGoal = goal.trim() || 'steady recovery';
  const normalizedDays = Math.max(3, Math.min(10, Number(days) || 5));
  const actions = [
    'Dim lights 60 minutes before bed and keep the room quieter than usual.',
    'Do 5 minutes of slower breathing, then write down one worry and one next step for tomorrow.',
    'Keep dinner lighter and avoid late caffeine or doom-scrolling.',
    'Take a warm shower or wash your face, then transition into a calm playlist.',
    'Rate your stress, energy, and sleep readiness in one short sentence.',
    'Choose one comforting ritual that feels easy enough to repeat tomorrow.',
    'Protect the same bedtime window to help your nervous system expect rest.'
  ];

  return {
    title: `${normalizedDays}-Day ${toTitleCase(normalizedGoal)} Plan`,
    summary: 'A local fallback care plan generated in the client because the backend GenAI service is unavailable right now.',
    days: Array.from({ length: normalizedDays }, (_, index) => ({
      day: index + 1,
      action: actions[index % actions.length],
      checkIn:
        index % 2 === 0
          ? 'Notice whether your shoulders, jaw, and breathing feel softer than earlier.'
          : 'Rate your evening calm from 1 to 5 and note one thing that helped.'
    }))
  };
};

const buildLocalVisualConcept = ({ mood, goal, aesthetic }) => {
  const paletteByMood = {
    Calm: ['#7dd3fc', '#2dd4bf', '#f8fafc'],
    Anxious: ['#60a5fa', '#14b8a6', '#e0f2fe'],
    Sad: ['#818cf8', '#93c5fd', '#e0e7ff'],
    Exhausted: ['#f59e0b', '#fb7185', '#fff7ed'],
    Hopeful: ['#34d399', '#facc15', '#f8fafc']
  };

  const normalizedMood = mood || 'Calm';
  const normalizedGoal = goal.trim() || 'steady recovery';
  const normalizedAesthetic = aesthetic || 'calm';

  return {
    generatorType: 'local fallback concept pack',
    conceptName: `${normalizedMood} ${normalizedGoal}`.trim(),
    prompt: `Create a ${normalizedAesthetic} wellness visual centered on ${normalizedMood.toLowerCase()} energy and ${normalizedGoal}. Use soft gradients, supportive light, gentle atmosphere, and uncluttered composition.`,
    negativePrompt: 'harsh contrast, chaotic noise, crowded layout, threatening imagery, visual overload',
    palette: paletteByMood[normalizedMood] || ['#38bdf8', '#34d399', '#f8fafc'],
    sceneElements: ['soft horizon light', 'slow-moving organic shapes', 'restorative open space', 'subtle hopeful texture']
  };
};

const buildLocalChatFallback = ({ message, mode }) => {
  const replyByMode = {
    support: `I could not reach the backend GenAI service, but I can still help locally. Based on "${message}", start with one calming action in the next 10 minutes and lower the pressure to do everything tonight.`,
    rag: `The retrieval service is offline right now, so I cannot pull your tracked context. A safe next step is to focus on one practical reset: slower breathing, lighter stimulation, and one small supportive action before bed.`
  };

  return {
    reply: replyByMode[mode] || replyByMode.support,
    suggestedActions: [
      'Take 5 slower exhales than inhales.',
      'Reduce one source of stimulation for the next 20 minutes.',
      'Choose the easiest next supportive step instead of the perfect one.'
    ],
    sources: []
  };
};

const Chatbot = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState('support');
  const [sessionId] = useState(() => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const [isWorking, setIsWorking] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [error, setError] = useState('');
  const [stack, setStack] = useState(null);
  const [planGoal, setPlanGoal] = useState('better sleep and calmer evenings');
  const [planDays, setPlanDays] = useState(5);
  const [visualMood, setVisualMood] = useState('Calm');
  const [visualGoal, setVisualGoal] = useState('steady recovery');
  const [visualAesthetic, setVisualAesthetic] = useState('calm');
  const messagesEndRef = useRef(null);

  const appendMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        ...message
      }
    ]);
  };

  const fetchStack = async () => {
    try {
      const response = await axios.get(`${API_URL}/genai/stack`, {
        params: { sessionId }
      });
      setStack(response.data.data);
      setError('');
    } catch (requestError) {
      setStack(fallbackStack);
      setError(requestError.response?.data?.message || 'Backend GenAI is offline right now. Local fallback generation is active.');
    }
  };

  useEffect(() => {
    fetchStack();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWorking]);

  const handleChatSend = async () => {
    if (!input.trim() || isWorking) return;

    const outgoing = input.trim();
    appendMessage({ type: 'user', text: outgoing });
    setInput('');
    setIsWorking(true);

    try {
      const response = await axios.post(`${API_URL}/genai/chat`, {
        message: outgoing,
        mode: activeMode,
        sessionId
      });

      const data = response.data.data;
      setCrisisDetected(Boolean(data.crisisDetected));
      appendMessage({
        type: 'bot',
        text: data.reply,
        sources: data.sources,
        suggestedActions: data.suggestedActions,
        retrieval: data.retrieval,
        reasoning: data.reasoning,
        metadata: data.model
      });
      setError('');
    } catch (requestError) {
      const fallback = buildLocalChatFallback({ message: outgoing, mode: activeMode });
      appendMessage({
        type: 'bot',
        text: fallback.reply,
        suggestedActions: fallback.suggestedActions,
        sources: fallback.sources,
        metadata: {
          provider: 'local-fallback',
          type: 'client-side support'
        }
      });
      setError(requestError.response?.data?.message || 'Backend GenAI is unavailable right now. Showing a local support fallback instead.');
    } finally {
      setIsWorking(false);
    }
  };

  const handlePlanGenerate = async () => {
    if (!planGoal.trim() || isWorking) return;

    appendMessage({
      type: 'user',
      text: `Generate a ${planDays}-day care plan for: ${planGoal}`
    });
    setIsWorking(true);

    try {
      const response = await axios.post(`${API_URL}/genai/care-plan`, {
        goal: planGoal,
        days: planDays
      });

      const plan = response.data?.data;

      if (!plan?.days?.length) {
        throw new Error('Invalid care plan response.');
      }

      appendMessage({
        type: 'bot',
        text: plan.summary,
        carePlan: plan
      });
      setError('');
    } catch (requestError) {
      const fallbackPlan = buildLocalCarePlan({ goal: planGoal, days: planDays });
      appendMessage({
        type: 'bot',
        text: 'The backend GenAI planner is unavailable right now, so I generated a local care plan fallback for you.',
        carePlan: fallbackPlan,
        metadata: {
          provider: 'local-fallback',
          type: 'client-side care plan'
        }
      });
      setError(requestError.response?.data?.message || 'Backend GenAI is unavailable right now. Showing a local fallback care plan instead.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleVisualGenerate = async () => {
    if (!visualGoal.trim() || isWorking) return;

    appendMessage({
      type: 'user',
      text: `Generate a ${visualAesthetic} wellness visual concept for ${visualMood.toLowerCase()} mood and ${visualGoal}.`
    });
    setIsWorking(true);

    try {
      const response = await axios.post(`${API_URL}/genai/visual-concept`, {
        mood: visualMood,
        goal: visualGoal,
        aesthetic: visualAesthetic
      });

      const concept = response.data?.data;

      if (!concept?.prompt || !Array.isArray(concept?.palette)) {
        throw new Error('Invalid visual concept response.');
      }

      appendMessage({
        type: 'bot',
        text: 'Here is a GAN-ready concept pack you can use for calming wallpapers, affirmation cards, or program covers.',
        visualConcept: concept
      });
      setError('');
    } catch (requestError) {
      const fallbackConcept = buildLocalVisualConcept({
        mood: visualMood,
        goal: visualGoal,
        aesthetic: visualAesthetic
      });
      appendMessage({
        type: 'bot',
        text: 'The backend visual generator is unavailable right now, so I created a local concept pack fallback for you.',
        visualConcept: fallbackConcept,
        metadata: {
          provider: 'local-fallback',
          type: 'client-side visual concept'
        }
      });
      setError(requestError.response?.data?.message || 'Backend GenAI is unavailable right now. Showing a local fallback visual concept instead.');
    } finally {
      setIsWorking(false);
    }
  };

  const renderBotExtras = (message) => (
    <div className="space-y-4 mt-4">
      {Array.isArray(message.suggestedActions) && message.suggestedActions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Suggested actions</p>
          {message.suggestedActions.map((action, index) => (
            <div key={`${message.id}-action-${index}`} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>{action}</span>
            </div>
          ))}
        </div>
      )}

      {message.retrieval && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium">
          Retrieval confidence: {message.retrieval.score} ({message.retrieval.band})
        </div>
      )}

      {Array.isArray(message.sources) && message.sources.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">RAG sources</p>
          <div className="grid md:grid-cols-2 gap-3">
            {message.sources.map((source) => (
              <div key={`${message.id}-${source.id}`} className="rounded-2xl border border-primary-100 dark:border-primary-500/20 bg-primary-50/70 dark:bg-primary-500/10 p-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{source.title}</p>
                <p className="text-xs text-primary-700 dark:text-primary-300 uppercase tracking-wide mt-1">
                  {source.category}
                  {source.sourceType ? ` • ${source.sourceType}` : ''}
                </p>
                {typeof source.confidence === 'number' && (
                  <p className="text-[11px] text-primary-600 dark:text-primary-300 mt-1">
                    score: {source.confidence}
                  </p>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-5">{source.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {message.carePlan && (
        <div className="rounded-2xl border border-amber-100 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/10 p-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{message.carePlan.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{message.carePlan.summary}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/80 dark:bg-gray-900/40 text-xs font-medium text-amber-700 dark:text-amber-300">
              GenAI Plan
            </div>
          </div>
          <div className="space-y-3">
            {message.carePlan.days.map((day) => (
              <div key={`${message.id}-day-${day.day}`} className="rounded-2xl bg-white/80 dark:bg-gray-900/30 p-3">
                <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-1">Day {day.day}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{day.action}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Check-in: {day.checkIn}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {message.visualConcept && (
        <div className="rounded-2xl border border-sky-100 dark:border-sky-500/20 bg-sky-50/70 dark:bg-sky-500/10 p-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{message.visualConcept.conceptName}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{message.visualConcept.generatorType}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/80 dark:bg-gray-900/40 text-xs font-medium text-sky-700 dark:text-sky-300">
              Visual Studio
            </div>
          </div>
          <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-4">
            <div className="space-y-3">
              <div className="rounded-2xl bg-white/80 dark:bg-gray-900/30 p-3">
                <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300 mb-2">Prompt</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-6">{message.visualConcept.prompt}</p>
              </div>
              <div className="rounded-2xl bg-white/80 dark:bg-gray-900/30 p-3">
                <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300 mb-2">Negative prompt</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-6">{message.visualConcept.negativePrompt}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-white/80 dark:bg-gray-900/30 p-3">
                <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300 mb-2">Color palette</p>
                <div className="flex gap-2">
                  {message.visualConcept.palette.map((color) => (
                    <div key={`${message.id}-${color}`} className="flex-1">
                      <div className="h-10 rounded-xl border border-white/60" style={{ backgroundColor: color }} />
                      <p className="text-[11px] text-center mt-1 text-gray-600 dark:text-gray-300">{color}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white/80 dark:bg-gray-900/30 p-3">
                <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300 mb-2">Scene elements</p>
                {message.visualConcept.sceneElements.map((item) => (
                  <div key={`${message.id}-${item}`} className="text-sm text-gray-700 dark:text-gray-200 leading-6">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const quickPrompts = quickPromptsByMode[activeMode] || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageExperience3D
        variant="chatbot"
        eyebrow="Conversational AI"
        title="GenAI Wellness Chat"
        description="A more immersive assistant workspace for support chat, RAG coaching, visual concepts, and care-plan generation."
        metrics={['RAG coach', 'Care plans', 'Visual studio']}
      />
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" />
              GenAI, RAG, and GAN-ready workspace
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="w-8 h-8 text-primary-500" />
              MindCare GenAI Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
              This workspace now supports retrieval-augmented coaching from your tracked data, multi-day care-plan generation,
              and GAN-ready concept packs for calming wellness visuals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              <Shield className="w-4 h-4" />
              Private & secure
            </div>
            <button
              type="button"
              onClick={fetchStack}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh stack
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-5 h-5 text-primary-500" />
            <h2 className="font-semibold">GenAI</h2>
          </div>
          <p className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${stackAccent.enabled}`}>
            {stack?.genAI || 'enabled'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Generative support now runs through backend AI endpoints instead of only canned chat text.
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-primary-500" />
            <h2 className="font-semibold">RAG</h2>
          </div>
          <p className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${stackAccent.enabled}`}>
            {stack?.rag || 'enabled'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Sources blend mood history, journal themes, and a curated wellness knowledge base.
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-5 h-5 text-primary-500" />
            <h2 className="font-semibold">GAN-ready</h2>
          </div>
          <p className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${stackAccent.ready}`}>
            {stack?.gan || 'ready'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Visual Studio creates prompt packs and palettes that can connect to future image generation pipelines.
          </p>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-900/10 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <AnimatePresence>
        {crisisDetected && (
          <motion.div
            className="glass-card p-4 border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-900/10"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-700 dark:text-red-300">Urgent support guidance</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  The assistant detected a possible safety concern. Use the Emergency Support page and reach live human help right away if there is immediate risk.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.entries(modeConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = activeMode === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveMode(key)}
              className={`text-left rounded-3xl border p-5 transition-all ${
                isActive
                  ? 'border-primary-200 bg-primary-50 dark:border-primary-500/30 dark:bg-primary-500/10 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 hover:border-primary-200 dark:hover:border-primary-500/20'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">{config.label}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-6">{config.description}</p>
            </button>
          );
        })}
      </div>

      <div className="glass-card p-4 md:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold">{modeConfig[activeMode].label}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{modeConfig[activeMode].description}</p>
          </div>
          {stack?.knowledgeDocuments && (
            <div className="px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-sm font-medium">
              {stack.knowledgeDocuments} knowledge docs active
            </div>
          )}
        </div>

        <div className="h-[28rem] overflow-y-auto pr-2 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <div className={`flex gap-3 max-w-[88%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' ? 'bg-primary-500' : 'bg-gradient-to-br from-primary-500 to-secondary-500'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-4 rounded-3xl ${
                    message.type === 'user'
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'glass-card rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-line leading-7">{message.text}</p>
                    {message.type === 'bot' && renderBotExtras(message)}
                    <p className={`text-xs mt-3 ${
                      message.type === 'user' ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isWorking && (
            <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex gap-3 max-w-[88%]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="glass-card p-4 rounded-3xl rounded-bl-none">
                  <div className="flex gap-1.5">
                    <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }} />
                    <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {(activeMode === 'support' || activeMode === 'rag') && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="px-4 py-2 rounded-full glass-card text-sm whitespace-nowrap hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="glass-card p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleChatSend()}
                placeholder={activeMode === 'rag' ? 'Ask for retrieval-backed guidance...' : 'Type your message...'}
                className="flex-1 input-field"
              />
              <button
                type="button"
                onClick={handleChatSend}
                disabled={!input.trim() || isWorking}
                className="btn-primary px-6 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              <Heart className="w-3 h-3 inline mr-1" />
              This assistant offers supportive wellness guidance, not medical diagnosis. Use Emergency Support for urgent risk.
            </p>
          </div>
        </>
      )}

      {activeMode === 'carePlan' && (
        <div className="glass-card p-5">
          <div className="grid lg:grid-cols-[1.3fr,0.7fr] gap-4">
            <label className="space-y-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Care-plan goal</span>
              <input
                type="text"
                value={planGoal}
                onChange={(event) => setPlanGoal(event.target.value)}
                className="w-full input-field"
                placeholder="Reduce stress and improve sleep"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Plan length</span>
              <select
                value={planDays}
                onChange={(event) => setPlanDays(Number(event.target.value))}
                className="w-full input-field"
              >
                {[3, 4, 5, 6, 7].map((days) => (
                  <option key={days} value={days}>
                    {days} days
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={handlePlanGenerate}
            disabled={!planGoal.trim() || isWorking}
            className="btn-primary mt-4 inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            Generate care plan
          </button>
        </div>
      )}

      {activeMode === 'visual' && (
        <div className="glass-card p-5">
          <div className="grid lg:grid-cols-3 gap-4">
            <label className="space-y-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Mood</span>
              <select value={visualMood} onChange={(event) => setVisualMood(event.target.value)} className="w-full input-field">
                {['Calm', 'Anxious', 'Sad', 'Exhausted', 'Hopeful'].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Goal</span>
              <input
                type="text"
                value={visualGoal}
                onChange={(event) => setVisualGoal(event.target.value)}
                className="w-full input-field"
                placeholder="restore emotional balance"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Aesthetic</span>
              <select value={visualAesthetic} onChange={(event) => setVisualAesthetic(event.target.value)} className="w-full input-field">
                {['calm', 'minimal', 'hopeful', 'dreamlike', 'nature-led'].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={handleVisualGenerate}
            disabled={!visualGoal.trim() || isWorking}
            className="btn-primary mt-4 inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Palette className="w-4 h-4" />
            Generate visual concept
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
