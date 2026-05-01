import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren,
  Phone,
  Heart,
  ExternalLink,
  MessageCircle,
  User,
  Wind,
  AlertTriangle,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const emergencyContacts = [
  {
    name: 'Tele-MANAS',
    number: '14416',
    callHref: 'tel:14416',
    description: '24/7 free national mental health support across India.',
    link: 'https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2100706'
  },
  {
    name: 'Tele-MANAS Toll-Free',
    number: '1800 891 4416',
    callHref: 'tel:18008914416',
    description: 'Alternate toll-free number for urgent emotional support in India.',
    link: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=1883139&lang=2&reg=3'
  },
  {
    name: 'Emergency Response',
    number: '112',
    callHref: 'tel:112',
    description: 'India single emergency number for police, ambulance, and fire.',
    link: 'https://www.112.gov.in/'
  },
  {
    name: 'Childline',
    number: '1098',
    callHref: 'tel:1098',
    description: '24/7 emergency support for children and adolescents in distress.',
    link: 'https://wcdhry.gov.in/child-help-line-chl/'
  }
];

const resources = [
  {
    title: 'Tele-MANAS Updates',
    description: 'Government of India updates on the national tele-mental health programme.',
    link: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2243766'
  },
  {
    title: '112 India',
    description: 'Official emergency support portal with service and app details.',
    link: 'https://www.112.gov.in/'
  },
  {
    title: 'Childline 1098',
    description: 'Official child emergency help resource for urgent support.',
    link: 'https://wcdhry.gov.in/child-help-line-chl/'
  }
];

const Emergency = () => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [sosActive, setSosActive] = useState(false);
  const [groundingStep, setGroundingStep] = useState(0);

  useEffect(() => {
    if (!isBreathing) return undefined;

    const phases = ['inhale', 'hold', 'exhale', 'hold'];
    const durations = [4000, 4000, 6000, 2000];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setBreathPhase(phases[currentIndex]);
    }, durations[currentIndex]);

    return () => clearInterval(interval);
  }, [isBreathing]);

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathPhase('inhale');
  };

  const stopBreathing = () => {
    setIsBreathing(false);
  };

  const groundingSteps = [
    'Name 5 things you can SEE around you',
    'Name 4 things you can TOUCH right now',
    'Name 3 things you can HEAR',
    'Name 2 things you can SMELL',
    'Name 1 thing you can TASTE'
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageExperience3D
        variant="emergency"
        eyebrow="Immediate support"
        title="Emergency Support"
        description="A clearer crisis-support surface with prominent safety pathways, grounding tools, and urgent contact actions."
        metrics={['SOS ready', 'Grounding', 'Contacts']}
      />
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
            <Siren className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-red-800 dark:text-red-200">Emergency Support</h1>
        </div>
        <p className="text-red-700 dark:text-red-300">
          If you or someone nearby is in immediate danger in India, call <strong>112</strong> now.
          For urgent mental health support, contact <strong>Tele-MANAS at 14416</strong> or
          <strong> 1800 891 4416</strong>. You are not alone.
        </p>
      </div>

      <motion.div
        className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-orange-800 dark:text-orange-200">Panic Attack SOS</h2>
              <p className="text-orange-700 dark:text-orange-300">Immediate grounding support for panic and overwhelm</p>
            </div>
          </div>
          <motion.button
            onClick={() => setSosActive(!sosActive)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              sosActive ? 'bg-red-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sosActive ? 'STOP SOS' : 'ACTIVATE SOS'}
          </motion.button>
        </div>

        <AnimatePresence>
          {sosActive && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-500" />
                  Box Breathing Exercise
                </h3>
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg"
                    animate={{
                      scale: isBreathing ? [1, 1.3, 1.3, 0.8, 1] : 1
                    }}
                    transition={{
                      duration: isBreathing ? 16 : 0,
                      repeat: isBreathing ? Infinity : 0,
                      ease: 'easeInOut'
                    }}
                  >
                    {breathPhase.toUpperCase()}
                  </motion.div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Follow the circle rhythm slowly</p>
                    {!isBreathing ? (
                      <motion.button
                        onClick={startBreathing}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 mx-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-4 h-4" />
                        Start Breathing
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={stopBreathing}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 mx-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Pause className="w-4 h-4" />
                        Stop Breathing
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  5-4-3-2-1 Grounding Technique
                </h3>
                <div className="space-y-3">
                  {groundingSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        index === groundingStep
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : index < groundingStep
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{step}</span>
                        {index < groundingStep && (
                          <span className="text-green-600 dark:text-green-400">Done</span>
                        )}
                        {index === groundingStep && (
                          <motion.button
                            onClick={() => setGroundingStep(index + 1)}
                            className="px-3 py-1 bg-pink-500 text-white rounded-lg text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Complete
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {groundingStep >= groundingSteps.length && (
                    <motion.div
                      className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <p className="text-green-700 dark:text-green-300 font-semibold">
                        You completed the grounding exercise. Stay with a trusted person if you still feel unsafe.
                      </p>
                      <motion.button
                        onClick={() => setGroundingStep(0)}
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Reset
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-500" />
                  Quick Calming Tips
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">-</span>
                    <span className="text-sm">Splash cool water on your face</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">-</span>
                    <span className="text-sm">Hold something cold in your hands</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">-</span>
                    <span className="text-sm">Sip water slowly and loosen your shoulders</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">-</span>
                    <span className="text-sm">Move to a quieter and safer place if possible</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Phone className="w-6 h-6 text-red-500" />
          Immediate Help in India
        </h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {emergencyContacts.map((contact) => (
            <div key={contact.name} className="glass-card p-6 border-l-4 border-l-red-500">
              <h3 className="font-semibold mb-2">{contact.name}</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">{contact.number}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{contact.description}</p>
              <div className="flex flex-col gap-2">
                <a
                  href={contact.callHref}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call now
                </a>
                <a
                  href={contact.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 text-sm text-primary-500 hover:text-primary-600"
                >
                  Learn more <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-500" />
          Coping Strategies
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary-500" />
              Reach Out Right Away
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>- Call Tele-MANAS and say clearly what feels unsafe or overwhelming.</li>
              <li>- Ask a trusted friend, partner, or family member to stay with you.</li>
              <li>- Contact your therapist, psychiatrist, counselor, or family doctor.</li>
              <li>- Go to the nearest hospital emergency or casualty department if risk feels immediate.</li>
            </ul>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-violet-500" />
              Self-Care for the Next 10 Minutes
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>- Practice the 5-4-3-2-1 grounding technique above.</li>
              <li>- Take slow breaths with a longer exhale than inhale.</li>
              <li>- Sit somewhere with light, air, and fewer triggers if you can.</li>
              <li>- Remind yourself that the wave can pass even if it feels intense right now.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
        <div className="space-y-3">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-4 flex items-center justify-between card-hover"
            >
              <div>
                <h3 className="font-semibold">{resource.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
          ))}
        </div>
      </div>

      <div className="glass-card p-8 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
        <h2 className="text-xl font-semibold mb-6 text-center">You Matter</h2>
        <div className="grid md:grid-cols-2 gap-4 text-center">
          {[
            'You are stronger than this moment',
            'This wave can pass',
            'You deserve support and care',
            'Your feelings are valid',
            'You are not a burden',
            'There is help available right now'
          ].map((affirmation) => (
            <div key={affirmation} className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
              <p className="font-medium text-gray-800 dark:text-gray-200">"{affirmation}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Important:</strong> MindCare AI is not a crisis service. If you are in immediate danger in
          India, call <strong>112</strong> now. For urgent mental health support, use <strong>Tele-MANAS
          14416</strong> or <strong>1800 891 4416</strong>. The resources listed above are provided for
          informational purposes.
        </p>
      </div>
    </div>
  );
};

export default Emergency;
