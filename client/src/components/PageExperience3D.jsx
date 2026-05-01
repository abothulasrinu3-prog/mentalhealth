import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookHeart,
  Bot,
  Brain,
  Calendar,
  Fingerprint,
  Heart,
  Home,
  MessageCircle,
  Moon,
  Pill,
  Shield,
  Sparkles,
  Target,
  User,
  Users,
  Utensils,
  Wind
} from 'lucide-react';

const IconMap = {
  insights: Brain,
  analytics: BarChart3,
  biometric: Fingerprint,
  breathing: Wind,
  care: Shield,
  chatbot: Bot,
  community: Users,
  affirmations: Sparkles,
  dashboard: Home,
  dream: Moon,
  emergency: AlertTriangle,
  family: Heart,
  habit: Target,
  journal: BookHeart,
  landing: Brain,
  medication: Pill,
  games: Sparkles,
  mood: Activity,
  nutrition: Utensils,
  period: Calendar,
  profile: User,
  sleep: Moon,
  therapist: MessageCircle
};

const toneMap = {
  insights: 'from-cyan-500 via-sky-500 to-indigo-500',
  analytics: 'from-sky-500 via-cyan-500 to-emerald-500',
  biometric: 'from-teal-500 via-cyan-500 to-sky-500',
  breathing: 'from-teal-500 via-emerald-500 to-lime-500',
  care: 'from-indigo-500 via-violet-500 to-fuchsia-500',
  chatbot: 'from-sky-500 via-indigo-500 to-violet-500',
  community: 'from-rose-500 via-pink-500 to-orange-400',
  affirmations: 'from-amber-400 via-orange-400 to-rose-500',
  dashboard: 'from-cyan-500 via-teal-500 to-emerald-500',
  dream: 'from-indigo-500 via-violet-500 to-slate-700',
  emergency: 'from-red-500 via-orange-500 to-amber-400',
  family: 'from-pink-500 via-rose-500 to-orange-400',
  habit: 'from-emerald-500 via-teal-500 to-cyan-500',
  journal: 'from-violet-500 via-indigo-500 to-sky-500',
  landing: 'from-sky-500 via-cyan-500 to-teal-500',
  medication: 'from-blue-500 via-cyan-500 to-emerald-500',
  games: 'from-amber-400 via-lime-500 to-emerald-500',
  mood: 'from-fuchsia-500 via-violet-500 to-sky-500',
  nutrition: 'from-green-500 via-emerald-500 to-teal-500',
  period: 'from-pink-500 via-rose-500 to-purple-500',
  profile: 'from-slate-700 via-sky-600 to-cyan-500',
  sleep: 'from-indigo-500 via-blue-500 to-cyan-500',
  therapist: 'from-purple-500 via-fuchsia-500 to-pink-500'
};

const PageExperience3D = ({
  variant = 'dashboard',
  eyebrow = 'MindCare AI',
  title,
  description,
  metrics = [],
  action,
  className = ''
}) => {
  const prefersReducedMotion = useReducedMotion();
  const Icon = IconMap[variant] || Brain;
  const tone = toneMap[variant] || toneMap.dashboard;
  const displayMetrics = metrics.length ? metrics : ['AI guided', '3D view', 'Live insights'];

  return (
    <section className={`page-hero-3d ${className}`}>
      <div className="page-hero-copy">
        <div className="page-hero-eyebrow">
          <Sparkles className="h-4 w-4" />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="page-hero-metrics">
          {displayMetrics.slice(0, 3).map((metric) => (
            <span key={metric}>{metric}</span>
          ))}
        </div>
        {action}
      </div>

      <div className="page-hero-visual" aria-hidden="true">
        <div className="page-hero-atmosphere">
          <span />
          <span />
          <span />
        </div>
        <motion.div
          className="page-hero-stage"
          animate={prefersReducedMotion ? {} : { rotateX: [58, 64, 58], rotateZ: [-10, 10, -10] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="page-hero-ring page-hero-ring-a" />
          <span className="page-hero-ring page-hero-ring-b" />
          <span className="page-hero-ring page-hero-ring-c" />
          <motion.div
            className={`page-hero-core bg-gradient-to-br ${tone}`}
            animate={prefersReducedMotion ? {} : { y: [0, -12, 0], rotateY: [0, 28, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon className="h-9 w-9 text-white" />
          </motion.div>
          {displayMetrics.slice(0, 3).map((metric, index) => (
            <motion.div
              key={metric}
              className={`page-hero-chip page-hero-chip-${index + 1}`}
              animate={prefersReducedMotion ? {} : { y: [0, index % 2 ? 9 : -9, 0] }}
              transition={{ duration: 4.6 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 }}
            >
              {metric}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PageExperience3D;
