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
      name: 'Memory Mindfulness',
      description: 'Mindful memory training exercises',
      icon: Zap,
      color: '#10b981',
      difficulty: 'intermediate'
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
