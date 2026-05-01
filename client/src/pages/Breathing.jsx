import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const breathingTechniques = [
  {
    name: '4-7-8 Relaxing Breath',
    description: 'Inhale for 4, hold for 7, exhale for 8. Promotes calm and relaxation.',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    color: 'from-primary-500 to-primary-600'
  },
  {
    name: 'Box Breathing',
    description: 'Inhale, hold, exhale, hold - all for 4 counts. Great for focus and stress relief.',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    color: 'from-violet-500 to-violet-600'
  },
  {
    name: 'Coherent Breathing',
    description: 'Breathe at 5 breaths per minute for optimal heart rate variability.',
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    color: 'from-emerald-500 to-emerald-600'
  }
];

const phases = ['inhale', 'hold1', 'exhale', 'hold2'];

const Breathing = () => {
  const [selectedTechnique, setSelectedTechnique] = useState(breathingTechniques[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const audioRef = useRef(null);

  const stopRelaxationMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const now = audio.context.currentTime;
    audio.gain.gain.cancelScheduledValues(now);
    audio.gain.gain.setTargetAtTime(0.0001, now, 0.45);

    window.setTimeout(() => {
      audio.oscillators.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // Oscillator may already be stopped by browser cleanup.
        }
      });
      audio.context.close();
      audioRef.current = null;
    }, 700);
  };

  const startRelaxationMusic = () => {
    if (!musicEnabled || audioRef.current) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const masterGain = context.createGain();
    const filter = context.createBiquadFilter();
    const delay = context.createDelay();
    const delayGain = context.createGain();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    filter.type = 'lowpass';
    filter.frequency.value = 820;
    delay.delayTime.value = 0.34;
    delayGain.gain.value = 0.16;
    masterGain.gain.value = 0.0001;

    const notes = [196, 246.94, 329.63, 392];
    const oscillators = notes.map((frequency, index) => {
      const oscillator = context.createOscillator();
      const voiceGain = context.createGain();

      oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      voiceGain.gain.value = index === 0 ? 0.18 : 0.08;
      oscillator.connect(voiceGain).connect(filter);
      oscillator.start();

      return oscillator;
    });

    lfo.frequency.value = 0.055;
    lfoGain.gain.value = 95;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    filter.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(filter);
    filter.connect(masterGain).connect(context.destination);

    masterGain.gain.setTargetAtTime(0.16, context.currentTime, 1.4);
    audioRef.current = {
      context,
      gain: masterGain,
      oscillators: [...oscillators, lfo]
    };
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Move to next phase
            setCurrentPhase(currentPhase => {
              const nextPhase = (currentPhase + 1) % 4;
              const phaseName = phases[nextPhase];
              const duration = selectedTechnique[phaseName];
              
              if (duration === 0) {
                // Skip this phase if duration is 0
                return (nextPhase + 1) % 4;
              }
              
              // Track completed cycles
              if (nextPhase === 0) {
                setCycles(c => c + 1);
              }
              
              return nextPhase;
            });
            return selectedTechnique[phases[(currentPhase + 1) % 4]] || 1;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, selectedTechnique, currentPhase]);

  useEffect(() => {
    if (!musicEnabled) {
      stopRelaxationMusic();
      return;
    }

    if (isRunning) {
      startRelaxationMusic();
    }
  }, [musicEnabled, isRunning]);

  useEffect(() => () => stopRelaxationMusic(), []);

  const start = () => {
    setIsRunning(true);
    setCountdown(selectedTechnique.inhale);
    setCurrentPhase(0);
    startRelaxationMusic();
  };

  const stop = () => {
    setIsRunning(false);
    setCountdown(0);
    setCurrentPhase(0);
    stopRelaxationMusic();
  };

  const reset = () => {
    stop();
    setCycles(0);
  };

  const getPhaseLabel = () => {
    const labels = {
      inhale: 'Breathe In',
      hold1: 'Hold',
      exhale: 'Breathe Out',
      hold2: 'Hold'
    };
    return labels[phases[currentPhase]] || '';
  };

  const getPhaseColor = () => {
    const colors = {
      inhale: 'bg-emerald-500',
      hold1: 'bg-amber-500',
      exhale: 'bg-blue-500',
      hold2: 'bg-amber-500'
    };
    return colors[phases[currentPhase]] || 'bg-gray-500';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageExperience3D
        variant="breathing"
        eyebrow="Guided breath studio"
        title="Breathing Exercise"
        description="Immersive animated breathing practice with 3D depth cues that help users settle into each phase."
        metrics={['4-7-8', 'Box breath', 'Coherent']}
      />
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Wind className="w-8 h-8 text-teal-500" />
          Breathing Exercise
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Guided breathing techniques to reduce stress and promote calm
        </p>
      </div>

      {/* Technique Selection */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {breathingTechniques.map((technique) => (
          <button
            key={technique.name}
            onClick={() => {
              setSelectedTechnique(technique);
              if (isRunning) reset();
            }}
            className={`glass-card p-4 text-left transition-all duration-300 ${
              selectedTechnique.name === technique.name
                ? 'ring-2 ring-primary-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
          >
            <h3 className="font-semibold mb-2">{technique.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{technique.description}</p>
          </button>
        ))}
      </div>

      {/* Breathing Animation */}
      <div className="glass-card p-8 mb-8">
        <div className="flex flex-col items-center">
          {/* Animation Circle */}
          <div className="relative w-64 h-64 mb-8">
            {/* Outer rings */}
            <div className={`absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700`} />
            
            {/* Animated circle */}
            <div 
              className={`absolute inset-0 rounded-full ${getPhaseColor()} opacity-20 transition-all duration-1000 ${
                isRunning ? 'scale-100' : 'scale-50'
              }`}
              style={{
                transform: isRunning ? 
                  phases[currentPhase] === 'inhale' ? 'scale(1)' : 
                  phases[currentPhase] === 'exhale' ? 'scale(0.5)' : 'scale(1)' 
                  : 'scale(0.5)'
              }}
            />
            
            {/* Inner circle with countdown */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center shadow-lg">
              <span className="text-5xl font-bold text-gray-800 dark:text-gray-200">
                {isRunning ? countdown : '--'}
              </span>
              <span className="text-sm text-gray-500 mt-2">seconds</span>
            </div>
          </div>

          {/* Phase Label */}
          <h2 className={`text-3xl font-bold mb-4 transition-colors ${
            isRunning ? getPhaseColor().replace('bg-', 'text-') : 'text-gray-400'
          }`}>
            {isRunning ? getPhaseLabel() : 'Ready to begin'}
          </h2>

          {/* Pattern indicator */}
          <div className="flex items-center gap-2 mb-6">
            {phases.map((phase, index) => {
              const duration = selectedTechnique[phase];
              if (duration === 0) return null;
              return (
                <div
                  key={phase}
                  className={`w-12 h-2 rounded-full transition-all duration-300 ${
                    index === currentPhase && isRunning
                      ? getPhaseColor()
                      : index < currentPhase && isRunning
                      ? 'bg-gray-300 dark:bg-gray-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={start}
                className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
              >
                <Play className="w-6 h-6" />
                Start
              </button>
            ) : (
              <button
                onClick={stop}
                className="btn-secondary flex items-center gap-2 px-8 py-4 text-lg"
              >
                <Pause className="w-6 h-6" />
                Stop
              </button>
            )}
            <button
              onClick={() => setMusicEnabled((enabled) => !enabled)}
              className={`flex items-center gap-2 rounded-xl px-4 py-4 font-medium transition-colors ${
                musicEnabled
                  ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-300 dark:hover:bg-teal-500/20'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
              title={musicEnabled ? 'Relaxation music on' : 'Relaxation music off'}
            >
              {musicEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              {musicEnabled ? 'Music on' : 'Music off'}
            </button>
            <button
              onClick={reset}
              className="p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          {cycles > 0 && (
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Completed <span className="font-semibold text-primary-500">{cycles}</span> breath cycles
            </p>
          )}
          <p className="mt-3 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
            Relaxation music starts automatically with the breathing session and stops when you pause or reset.
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">How to practice {selectedTechnique.name}</h3>
        <ol className="space-y-3 text-gray-600 dark:text-gray-400 list-decimal list-inside">
          {selectedTechnique.inhale > 0 && (
            <li>Inhale slowly through your nose for <strong>{selectedTechnique.inhale} seconds</strong></li>
          )}
          {selectedTechnique.hold1 > 0 && (
            <li>Hold your breath for <strong>{selectedTechnique.hold1} seconds</strong></li>
          )}
          {selectedTechnique.exhale > 0 && (
            <li>Exhale slowly through your mouth for <strong>{selectedTechnique.exhale} seconds</strong></li>
          )}
          {selectedTechnique.hold2 > 0 && (
            <li>Hold for <strong>{selectedTechnique.hold2} seconds</strong> before the next breath</li>
          )}
          <li>Repeat the cycle for several minutes</li>
        </ol>
        <p className="mt-4 text-sm text-gray-500">
          Tip: Practice in a comfortable seated position with your back straight. 
          Close your eyes and focus on the sensation of your breath.
        </p>
      </div>
    </div>
  );
};

export default Breathing;
