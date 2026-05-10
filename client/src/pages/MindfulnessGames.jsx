import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Sparkles, Zap, Target, Play, Pause, RotateCcw, Award, Volume2, VolumeX } from 'lucide-react';
import WellnessScene3D from '../components/WellnessScene3D';

const MindfulnessGames = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [meditationTime, setMeditationTime] = useState(0);
  const [focusTargets, setFocusTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [gratitudeItems, setGratitudeItems] = useState([]);
  const [currentGratitude, setCurrentGratitude] = useState('');
  const [groundingChecks, setGroundingChecks] = useState({});
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [worryIndex, setWorryIndex] = useState(0);
  const [worryAnswers, setWorryAnswers] = useState([]);
  const [kindnessChecks, setKindnessChecks] = useState({});

  const games = [
    {
      id: 'breathing',
      name: 'Breathing Exercise',
      description: 'Guided breathing patterns for relaxation',
      icon: Heart,
      color: '#ef4444',
      difficulty: 'beginner'
    },
    {
      id: 'meditation',
      name: 'Mindful Meditation',
      description: 'Focus and awareness practice',
      icon: Brain,
      color: '#8b5cf6',
      difficulty: 'beginner'
    },
    {
      id: 'focus',
      name: 'Focus Training',
      description: 'Improve concentration and attention',
      icon: Target,
      color: '#3b82f6',
      difficulty: 'intermediate'
    },
    {
      id: 'gratitude',
      name: 'Gratitude Journal',
      description: 'Practice thankfulness and positivity',
      icon: Sparkles,
      color: '#f59e0b',
      difficulty: 'beginner'
    },
    {
      id: 'memory',
      name: 'Calm Memory Match',
      description: 'Match calming symbols with slow attention',
      icon: Zap,
      color: '#10b981',
      difficulty: 'intermediate'
    },
    {
      id: 'grounding',
      name: '5 Senses Grounding',
      description: 'A quick sensory reset for anxious moments',
      icon: Sparkles,
      color: '#14b8a6',
      difficulty: 'beginner'
    },
    {
      id: 'worry-sorter',
      name: 'Worry Sorter',
      description: 'Sort thoughts into action or release',
      icon: Target,
      color: '#6366f1',
      difficulty: 'all ages'
    },
    {
      id: 'kindness-quest',
      name: 'Kindness Quest',
      description: 'Small compassion missions for self and others',
      icon: Heart,
      color: '#ec4899',
      difficulty: 'all ages'
    }
  ];

  // Breathing Exercise Logic
  useEffect(() => {
    if (selectedGame === 'breathing' && isPlaying) {
      const interval = setInterval(() => {
        setBreathingPhase(prev => {
          const phases = ['inhale', 'hold', 'exhale', 'hold'];
          const currentIndex = phases.indexOf(prev);
          const nextIndex = (currentIndex + 1) % phases.length;
          return phases[nextIndex];
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedGame, isPlaying]);

  // Meditation Timer
  useEffect(() => {
    if (selectedGame === 'meditation' && isPlaying) {
      const interval = setInterval(() => {
        setMeditationTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedGame, isPlaying]);

  // Focus Game Timer
  useEffect(() => {
    if (selectedGame === 'focus' && isPlaying && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0 && selectedGame === 'focus') {
      endGame();
    }
  }, [selectedGame, isPlaying, timeLeft]);

  // Initialize Focus Game
  const initializeFocusGame = useCallback(() => {
    const targets = [];
    for (let i = 0; i < 9; i++) {
      targets.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 30 + 20,
        color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)]
      });
    }
    setFocusTargets(targets);
  }, []);

  const initializeMemoryGame = () => {
    const symbols = ['Breathe', 'Cloud', 'Leaf', 'Moon', 'Wave', 'Light'];
    const cards = [...symbols, ...symbols]
      .map((symbol, index) => ({ id: `${symbol}-${index}`, symbol }))
      .sort(() => Math.random() - 0.5);

    setMemoryCards(cards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMemoryMoves(0);
  };

  const startGame = (gameId) => {
    setSelectedGame(gameId);
    setGameState('playing');
    setIsPlaying(true);
    setScore(0);
    setLevel(1);
    
    if (gameId === 'focus') {
      setTimeLeft(60);
      initializeFocusGame();
    } else if (gameId === 'meditation') {
      setMeditationTime(0);
    } else if (gameId === 'memory') {
      initializeMemoryGame();
    } else if (gameId === 'grounding') {
      setGroundingChecks({});
    } else if (gameId === 'worry-sorter') {
      setWorryIndex(0);
      setWorryAnswers([]);
    } else if (gameId === 'kindness-quest') {
      setKindnessChecks({});
    }
  };

  const pauseGame = () => {
    setIsPlaying(!isPlaying);
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameState('completed');
  };

  const resetGame = () => {
    setSelectedGame(null);
    setGameState('menu');
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setIsPlaying(false);
    setBreathingPhase('inhale');
    setBreathingCount(0);
    setMeditationTime(0);
    setFocusTargets([]);
    setSelectedTarget(null);
    setGroundingChecks({});
    setMemoryCards([]);
    setFlippedCards([]);
    setMatchedCards([]);
    setMemoryMoves(0);
    setWorryIndex(0);
    setWorryAnswers([]);
    setKindnessChecks({});
  };

  const handleTargetClick = (target) => {
    if (selectedGame === 'focus' && isPlaying) {
      setScore(prev => prev + 10);
      setFocusTargets(prev => prev.filter(t => t.id !== target.id));
      
      if (focusTargets.length === 1) {
        setLevel(prev => prev + 1);
        setTimeLeft(prev => Math.min(prev + 10, 60));
        initializeFocusGame();
      }
    }
  };

  const addGratitudeItem = () => {
    if (currentGratitude.trim()) {
      setGratitudeItems(prev => [...prev, currentGratitude.trim()]);
      setCurrentGratitude('');
      setScore(prev => prev + 5);
    }
  };

  const handleMemoryCardClick = (card) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.some((item) => item.id === card.id) ||
      matchedCards.includes(card.symbol)
    ) {
      return;
    }

    setFlippedCards((prev) => [...prev, card]);
  };

  useEffect(() => {
    if (flippedCards.length !== 2) return;

    setMemoryMoves((prev) => prev + 1);
    const [first, second] = flippedCards;

    if (first.symbol === second.symbol) {
      setMatchedCards((prev) => [...prev, first.symbol]);
      setScore((prev) => prev + 15);
      setFlippedCards([]);
      return;
    }

    const timeout = setTimeout(() => setFlippedCards([]), 850);
    return () => clearTimeout(timeout);
  }, [flippedCards]);

  useEffect(() => {
    if (selectedGame === 'memory' && memoryCards.length > 0 && matchedCards.length === 6) {
      endGame();
    }
  }, [matchedCards, memoryCards.length, selectedGame]);

  const toggleGroundingCheck = (key) => {
    setGroundingChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setScore(Object.values(next).filter(Boolean).length * 10);
      return next;
    });
  };

  const worryPrompts = [
    {
      text: 'I have a test or meeting tomorrow.',
      answer: 'act',
      action: 'Prepare one small step, then rest.'
    },
    {
      text: 'Someone may not like what I said.',
      answer: 'release',
      action: 'If needed, repair kindly. Release mind-reading.'
    },
    {
      text: 'My room or desk feels messy.',
      answer: 'act',
      action: 'Set a five-minute timer and clear one surface.'
    },
    {
      text: 'I keep replaying an old mistake.',
      answer: 'release',
      action: 'Take the lesson, then come back to now.'
    },
    {
      text: 'I forgot to drink enough water today.',
      answer: 'act',
      action: 'Drink one glass and place water nearby.'
    }
  ];

  const kindnessQuests = [
    { key: 'self', label: 'Say one kind sentence to yourself', hint: 'Try: I am learning, and I can begin again.' },
    { key: 'body', label: 'Relax your shoulders for three breaths', hint: 'Let your jaw and hands soften too.' },
    { key: 'thanks', label: 'Thank someone or remember someone helpful', hint: 'A message, a thought, or a quiet thank-you counts.' },
    { key: 'space', label: 'Make one tiny part of your space calmer', hint: 'Move one item, close one tab, or clear one cup.' },
    { key: 'future', label: 'Do one small favor for future you', hint: 'Set out water, write a reminder, or prepare the next step.' }
  ];

  const answerWorry = (choice) => {
    const prompt = worryPrompts[worryIndex];
    const isCorrect = choice === prompt.answer;
    const nextAnswers = [...worryAnswers, { ...prompt, choice, isCorrect }];

    setWorryAnswers(nextAnswers);
    setScore((prev) => prev + (isCorrect ? 12 : 4));

    if (worryIndex >= worryPrompts.length - 1) {
      endGame();
      return;
    }

    setWorryIndex((prev) => prev + 1);
  };

  const toggleKindnessQuest = (key) => {
    setKindnessChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const doneCount = Object.values(next).filter(Boolean).length;
      setScore(doneCount * 10);
      return next;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderBreathingExercise = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2">Breathing Exercise</h3>
        <p className="text-gray-600 dark:text-gray-400">Follow the circle for guided breathing</p>
      </div>

      <div className="relative w-64 h-64 mx-auto mb-8">
        <motion.div
          className="absolute inset-0 bg-red-500 rounded-full opacity-20"
          animate={{
            scale: breathingPhase === 'inhale' ? 1.3 : 
                   breathingPhase === 'hold' ? 1.3 : 
                   breathingPhase === 'exhale' ? 0.7 : 0.7
          }}
          transition={{ duration: 4, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl"
          animate={{
            scale: breathingPhase === 'inhale' ? 1.3 : 
                   breathingPhase === 'hold' ? 1.3 : 
                   breathingPhase === 'exhale' ? 0.7 : 0.7
          }}
          transition={{ duration: 4, ease: 'easeInOut' }}
        >
          {breathingPhase.charAt(0).toUpperCase() + breathingPhase.slice(1)}
        </motion.div>
      </div>

      <div className="flex justify-center gap-4">
        <motion.button
          onClick={pauseGame}
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pause' : 'Resume'}
        </motion.button>
        <motion.button
          onClick={resetGame}
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </motion.button>
      </div>
    </div>
  );

  const renderMeditation = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2">Mindful Meditation</h3>
        <p className="text-gray-600 dark:text-gray-400">Focus on your breath and be present</p>
      </div>

      <div className="relative w-48 h-48 mx-auto mb-8">
        <motion.div
          className="absolute inset-0 bg-purple-500 rounded-full opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-16 h-16 text-purple-500" />
        </div>
      </div>

      <div className="text-4xl font-bold mb-8 text-purple-600">
        {formatTime(meditationTime)}
      </div>

      <div className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Breathe in... Breathe out...
      </div>

      <div className="flex justify-center gap-4">
        <motion.button
          onClick={pauseGame}
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pause' : 'Resume'}
        </motion.button>
        <motion.button
          onClick={resetGame}
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
          End Session
        </motion.button>
      </div>
    </div>
  );

  const renderFocusGame = () => (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold mb-2">Focus Training</h3>
          <p className="text-gray-600 dark:text-gray-400">Click the targets as quickly as possible</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-2xl font-bold text-blue-600">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Time</div>
            <div className="text-2xl font-bold text-red-600">{formatTime(timeLeft)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Level</div>
            <div className="text-2xl font-bold text-green-600">{level}</div>
          </div>
        </div>
      </div>

      <div className="relative h-96 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
        {focusTargets.map(target => (
          <motion.div
            key={target.id}
            className="absolute cursor-pointer"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: `${target.size}px`,
              height: `${target.size}px`
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTargetClick(target)}
          >
            <div 
              className="w-full h-full rounded-full"
              style={{ backgroundColor: target.color }}
            />
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <motion.button
          onClick={pauseGame}
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pause' : 'Resume'}
        </motion.button>
        <motion.button
          onClick={resetGame}
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
          New Game
        </motion.button>
      </div>
    </div>
  );

  const renderGratitudeJournal = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold mb-2">Gratitude Journal</h3>
        <p className="text-gray-600 dark:text-gray-400">Write down things you're grateful for</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentGratitude}
            onChange={(e) => setCurrentGratitude(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addGratitudeItem()}
            placeholder="What are you grateful for today?"
            className="flex-1 input-field"
          />
          <motion.button
            onClick={addGratitudeItem}
            disabled={!currentGratitude.trim()}
            className="btn-primary disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add
          </motion.button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <AnimatePresence>
          {gratitudeItems.map((item, index) => (
            <motion.div
              key={index}
              className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-yellow-500 mt-1" />
                <p className="flex-1">{item}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {gratitudeItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Start adding things you're grateful for...</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Score: {score} points • {gratitudeItems.length} items
        </div>
        <motion.button
          onClick={resetGame}
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
          Clear All
        </motion.button>
      </div>
    </div>
  );

  const groundingSteps = [
    { key: 'see', count: 5, label: 'things you can see', prompt: 'Look around and name them slowly.' },
    { key: 'feel', count: 4, label: 'things you can feel', prompt: 'Notice texture, pressure, or temperature.' },
    { key: 'hear', count: 3, label: 'sounds you can hear', prompt: 'Let each sound arrive without chasing it.' },
    { key: 'smell', count: 2, label: 'things you can smell', prompt: 'If nothing is clear, notice the air.' },
    { key: 'taste', count: 1, label: 'thing you can taste', prompt: 'Notice one small detail in your mouth.' }
  ];

  const renderGroundingGame = () => {
    const completed = Object.values(groundingChecks).filter(Boolean).length;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold mb-2">5 Senses Grounding</h3>
          <p className="text-gray-600 dark:text-gray-400">Move through each sense and tap it when you complete it.</p>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <motion.div
            className="h-full bg-teal-500"
            animate={{ width: `${(completed / groundingSteps.length) * 100}%` }}
          />
        </div>

        <div className="grid gap-3">
          {groundingSteps.map((step) => (
            <motion.button
              key={step.key}
              type="button"
              onClick={() => toggleGroundingCheck(step.key)}
              className={`rounded-2xl border p-4 text-left transition ${
                groundingChecks[step.key]
                  ? 'border-teal-400 bg-teal-50 dark:border-teal-500 dark:bg-teal-900/20'
                  : 'border-gray-200 bg-white/70 dark:border-gray-700 dark:bg-gray-800/70'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{step.count} {step.label}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{step.prompt}</p>
                </div>
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-300">
                  {groundingChecks[step.key] ? 'Done' : 'Tap'}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {completed}/{groundingSteps.length} complete
          </div>
          <motion.button
            onClick={completed === groundingSteps.length ? endGame : resetGame}
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {completed === groundingSteps.length ? <Award className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
            {completed === groundingSteps.length ? 'Finish' : 'Reset'}
          </motion.button>
        </div>
      </div>
    );
  };

  const renderMemoryGame = () => (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">Calm Memory Match</h3>
          <p className="text-gray-600 dark:text-gray-400">Flip two cards at a time. Pause and breathe before each choice.</p>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Matches</div>
            <div className="text-2xl font-bold text-emerald-600">{matchedCards.length}/6</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Moves</div>
            <div className="text-2xl font-bold text-cyan-600">{memoryMoves}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {memoryCards.map((card) => {
          const isOpen = flippedCards.some((item) => item.id === card.id) || matchedCards.includes(card.symbol);

          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={() => handleMemoryCardClick(card)}
              className={`aspect-[4/3] rounded-2xl border text-sm font-semibold shadow-sm transition ${
                isOpen
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-200'
                  : 'border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              {isOpen ? card.symbol : 'Breathe'}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <motion.button
          onClick={() => {
            setScore(0);
            initializeMemoryGame();
          }}
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
          New Layout
        </motion.button>
      </div>
    </div>
  );

  const renderWorrySorter = () => {
    const prompt = worryPrompts[worryIndex];

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Worry Sorter</h3>
          <p className="text-gray-600 dark:text-gray-400">Choose whether each thought needs a small action or a gentle release.</p>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
            Card {worryIndex + 1} of {worryPrompts.length}
          </span>
          <span className="text-sm text-gray-500">Score {score}</span>
        </div>

        <motion.div
          key={prompt.text}
          className="mb-6 rounded-3xl border border-indigo-100 bg-indigo-50 p-6 text-center dark:border-indigo-800 dark:bg-indigo-900/20"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xl font-semibold text-indigo-950 dark:text-indigo-100">{prompt.text}</p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2">
          <motion.button
            type="button"
            onClick={() => answerWorry('act')}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left dark:border-emerald-700 dark:bg-emerald-900/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <p className="font-semibold text-emerald-700 dark:text-emerald-300">I can act</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Pick one small next step.</p>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => answerWorry('release')}
            className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-left dark:border-sky-700 dark:bg-sky-900/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <p className="font-semibold text-sky-700 dark:text-sky-300">I can release</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Notice it, breathe, and let it pass.</p>
          </motion.button>
        </div>

        {worryAnswers.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white/70 p-4 dark:bg-gray-800/70">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Last reflection</p>
            <p className="mt-1 text-sm">{worryAnswers[worryAnswers.length - 1].action}</p>
          </div>
        )}
      </div>
    );
  };

  const renderKindnessQuest = () => {
    const completed = Object.values(kindnessChecks).filter(Boolean).length;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Kindness Quest</h3>
          <p className="text-gray-600 dark:text-gray-400">Complete small compassion missions at your own pace.</p>
        </div>

        <div className="mb-6 grid gap-3">
          {kindnessQuests.map((quest) => (
            <motion.button
              key={quest.key}
              type="button"
              onClick={() => toggleKindnessQuest(quest.key)}
              className={`rounded-2xl border p-4 text-left transition ${
                kindnessChecks[quest.key]
                  ? 'border-pink-300 bg-pink-50 dark:border-pink-500 dark:bg-pink-900/20'
                  : 'border-gray-200 bg-white/70 dark:border-gray-700 dark:bg-gray-800/70'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{quest.label}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{quest.hint}</p>
                </div>
                <span className="text-sm font-semibold text-pink-600 dark:text-pink-300">
                  {kindnessChecks[quest.key] ? 'Done' : 'Try'}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Quest progress</p>
            <p className="text-2xl font-bold text-pink-600">{completed}/{kindnessQuests.length}</p>
          </div>
          <motion.button
            onClick={completed === kindnessQuests.length ? endGame : resetGame}
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {completed === kindnessQuests.length ? <Award className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
            {completed === kindnessQuests.length ? 'Finish Quest' : 'Reset'}
          </motion.button>
        </div>
      </div>
    );
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'breathing':
        return renderBreathingExercise();
      case 'meditation':
        return renderMeditation();
      case 'focus':
        return renderFocusGame();
      case 'gratitude':
        return renderGratitudeJournal();
      case 'memory':
        return renderMemoryGame();
      case 'grounding':
        return renderGroundingGame();
      case 'worry-sorter':
        return renderWorrySorter();
      case 'kindness-quest':
        return renderKindnessQuest();
      default:
        return null;
    }
  };

  return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="wellness-hero-panel p-5 md:p-7">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr,360px]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                <Sparkles className="h-4 w-4" />
                Interactive calm studio
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">
                Mindfulness Games
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300 md:text-lg">
                Guided play for breathing, focus, gratitude, and meditation, with tactile motion that makes daily practice feel easier to start.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm dark:bg-white/5 dark:text-gray-200"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  {soundEnabled ? 'Sound on' : 'Sound off'}
                </motion.button>
                <span className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm dark:bg-white/5 dark:text-gray-200">
                  {games.length} exercises
                </span>
              </div>
            </div>
            <WellnessScene3D variant="games" compact />
          </div>
        </div>

        {/* Game Menu */}
        {gameState === 'menu' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => {
              const Icon = game.icon;
              return (
                <motion.div
                  key={game.id}
                  className="glass-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => startGame(game.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${game.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: game.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{game.name}</h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        {game.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {game.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Game Playing */}
        {gameState === 'playing' && (
          <motion.div
            className="glass-card p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {renderGame()}
          </motion.div>
        )}

        {/* Game Completed */}
        {gameState === 'completed' && (
          <motion.div
            className="glass-card p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-2xl font-bold mb-2">Great Job!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've completed the mindfulness exercise
            </p>
            <div className="text-4xl font-bold text-blue-600 mb-6">
              Score: {score}
            </div>
            <motion.button
              onClick={resetGame}
              className="btn-primary flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
              Play Again
            </motion.button>
          </motion.div>
        )}

        {/* Benefits Section */}
        <div className="glass-card p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <h3 className="text-lg font-semibold mb-4">Benefits of Mindfulness Games</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700 dark:text-purple-300">Mental Health</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Reduces stress and anxiety</li>
                <li>• Improves focus and concentration</li>
                <li>• Enhances emotional regulation</li>
                <li>• Increases self-awareness</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Daily Practice</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Start with 5-10 minutes daily</li>
                <li>• Choose exercises that resonate with you</li>
                <li>• Be consistent with your practice</li>
                <li>• Track your progress over time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MindfulnessGames;
