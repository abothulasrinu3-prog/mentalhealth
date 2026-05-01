import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import LanguageSwitcher from '../components/LanguageSwitcher';
import WellnessScene3D from '../components/WellnessScene3D';
import { useLanguage } from '../context/LanguageContext';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookHeart,
  Bot,
  Brain,
  Calendar,
  ChevronRight,
  Heart,
  Lock,
  Moon,
  Play,
  Quote,
  Shield,
  Sparkles,
  Star,
  Wind
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08
    }
  }
};

const navLinks = [
  { labelKey: 'landing.nav.features', target: 'features' },
  { labelKey: 'landing.nav.experience', target: 'experience' },
  { labelKey: 'landing.nav.stories', target: 'stories' }
];

const marqueeKeys = Array.from({ length: 8 }, (_, index) => `landing.marquee.${index}`);

const heroSignalTiles = [
  { label: 'Mood pulse', value: '+18%', icon: Heart, tone: 'from-rose-500 to-pink-500' },
  { label: 'Sleep depth', value: '7.8h', icon: Moon, tone: 'from-indigo-500 to-cyan-500' },
  { label: 'Care fit', value: '92%', icon: Shield, tone: 'from-emerald-500 to-teal-500' }
];

const orbitMetrics = [
  { label: 'Stress', value: 'low' },
  { label: 'Focus', value: 'clear' },
  { label: 'Energy', value: 'steady' },
  { label: 'Safety', value: 'ready' }
];

const realisticPanels = [
  {
    title: 'Calm morning check-in',
    detail: 'A human-first mood flow with soft guidance and reassuring progress.',
    mood: 'Hopeful',
    className: 'landing-life-card-morning'
  },
  {
    title: 'Therapy-style support',
    detail: 'Clear next steps, gentle coaching, and crisis-aware safety moments.',
    mood: 'Supported',
    className: 'landing-life-card-care'
  },
  {
    title: 'Night recovery ritual',
    detail: 'Sleep, breathing, and journal reflections presented like a real wellness studio.',
    mood: 'Rested',
    className: 'landing-life-card-night'
  }
];

const capabilityCards = [
  {
    icon: Brain,
    titleKey: 'landing.capabilities.0.title',
    descriptionKey: 'landing.capabilities.0.description',
    tone: 'from-sky-500 via-cyan-500 to-teal-500',
    span: 'lg:col-span-2'
  },
  {
    icon: Calendar,
    titleKey: 'landing.capabilities.1.title',
    descriptionKey: 'landing.capabilities.1.description',
    tone: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Lock,
    titleKey: 'landing.capabilities.2.title',
    descriptionKey: 'landing.capabilities.2.description',
    tone: 'from-slate-600 to-slate-800'
  },
  {
    icon: Activity,
    titleKey: 'landing.capabilities.3.title',
    descriptionKey: 'landing.capabilities.3.description',
    tone: 'from-orange-500 to-rose-500'
  },
  {
    icon: Shield,
    titleKey: 'landing.capabilities.4.title',
    descriptionKey: 'landing.capabilities.4.description',
    tone: 'from-violet-500 to-fuchsia-500',
    span: 'lg:col-span-2'
  }
];

const journeySteps = [
  {
    icon: Heart,
    titleKey: 'landing.journeySteps.0.title',
    descriptionKey: 'landing.journeySteps.0.description'
  },
  {
    icon: BarChart3,
    titleKey: 'landing.journeySteps.1.title',
    descriptionKey: 'landing.journeySteps.1.description'
  },
  {
    icon: Sparkles,
    titleKey: 'landing.journeySteps.2.title',
    descriptionKey: 'landing.journeySteps.2.description'
  }
];

const stories = [
  {
    nameKey: 'landing.stories.0.name',
    roleKey: 'landing.stories.0.role',
    quoteKey: 'landing.stories.0.quote',
    focusKey: 'landing.stories.0.focus'
  },
  {
    nameKey: 'landing.stories.1.name',
    roleKey: 'landing.stories.1.role',
    quoteKey: 'landing.stories.1.quote',
    focusKey: 'landing.stories.1.focus'
  },
  {
    nameKey: 'landing.stories.2.name',
    roleKey: 'landing.stories.2.role',
    quoteKey: 'landing.stories.2.quote',
    focusKey: 'landing.stories.2.focus'
  }
];

const Landing = () => {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, prefersReducedMotion ? 0 : -70]);
  const cardY = useTransform(scrollYProgress, [0, 0.6], [0, prefersReducedMotion ? 0 : 90]);
  const [activeStory, setActiveStory] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStory((current) => (current + 1) % stories.length);
    }, 4800);

    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing-body relative min-h-screen overflow-x-hidden bg-[#f3fbff] text-slate-900 dark:bg-[#07131b] dark:text-slate-50">
      <div className="landing-mesh fixed inset-0 pointer-events-none" />
      <motion.div style={{ y: cardY }} className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="landing-orb absolute -top-24 left-[8%] h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl dark:bg-cyan-500/15" />
        <div className="landing-orb landing-orb-delayed absolute top-[18%] right-[6%] h-[26rem] w-[26rem] rounded-full bg-fuchsia-300/30 blur-3xl dark:bg-fuchsia-500/10" />
        <div className="landing-orb landing-orb-slow absolute bottom-[8%] left-[38%] h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/10" />
      </motion.div>

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-full border border-white/60 bg-white/80 px-4 py-3 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 shadow-lg shadow-cyan-500/30">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="landing-display text-base font-bold tracking-tight">{t('common.appName')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('navbar.tagline')}</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => scrollToSection(item.target)}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher compact className="hidden sm:inline-flex" />
            <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300 sm:inline-flex">
              {t('common.signIn')}
            </Link>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm">
              {t('common.createAccount')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.nav>

      <main className="relative pt-28">
        <section className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 xl:grid-cols-[1.02fr,0.98fr]">
            <motion.div
              style={{ y: heroY }}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="relative z-10"
            >
              <motion.div
                variants={fadeInUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm shadow-sky-100/80 backdrop-blur-xl dark:border-sky-400/20 dark:bg-slate-950/55 dark:text-sky-300"
              >
                <Sparkles className="h-4 w-4" />
                {t('landing.badge')}
              </motion.div>

              <motion.h1 variants={fadeInUp} className="landing-display max-w-4xl text-5xl font-bold leading-[0.96] tracking-tight text-slate-950 dark:text-white md:text-7xl">
                {t('landing.heroTitleStart')}
                <span className="block bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  {t('landing.heroTitleAccent')}
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 md:text-xl">
                {t('landing.heroDescription')}
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base">
                  {t('common.startFree')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base"
                >
                  <Play className="h-4 w-4" />
                  {t('landing.nav.features')}
                </button>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Bot, label: t('landing.heroChips.aiTitle'), detail: t('landing.heroChips.aiDetail') },
                  { icon: Calendar, label: t('landing.heroChips.programsTitle'), detail: t('landing.heroChips.programsDetail') },
                  { icon: Shield, label: t('landing.heroChips.safetyTitle'), detail: t('landing.heroChips.safetyDetail') }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="landing-depth-card rounded-3xl border border-white/70 bg-white/70 p-4 shadow-lg shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-none"
                    animate={prefersReducedMotion ? {} : { y: [0, index % 2 ? 10 : -10, 0], rotateY: [0, index % 2 ? -4 : 4, 0] }}
                    transition={{ duration: 6 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 }}
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg shadow-cyan-500/30">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.detail}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp} className="landing-signal-stack mt-6 grid gap-3 sm:grid-cols-3">
                {heroSignalTiles.map((tile, index) => (
                  <motion.div
                    key={tile.label}
                    className="landing-signal-tile"
                    animate={prefersReducedMotion ? {} : { rotateX: [0, 7, 0], rotateZ: [0, index === 1 ? -1.8 : 1.8, 0] }}
                    transition={{ duration: 5.4 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
                  >
                    <div className={`landing-signal-icon bg-gradient-to-br ${tile.tone}`}>
                      <tile.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{tile.label}</p>
                      <p className="landing-display mt-1 text-2xl font-bold text-slate-950 dark:text-white">{tile.value}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-sky-300/25 via-cyan-200/30 to-emerald-300/20 blur-3xl dark:from-sky-500/10 dark:via-cyan-500/10 dark:to-emerald-500/10" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/65 dark:shadow-black/25 md:p-7">
                <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent dark:via-sky-400/40" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">{t('landing.board.label')}</p>
                    <h2 className="landing-display mt-2 text-2xl font-bold text-slate-950 dark:text-white">{t('landing.board.title')}</h2>
                  </div>
                  <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {t('landing.board.live')}
                  </div>
                </div>

                <div className="mt-7 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
                  <div className="space-y-4">
                    <div className="relative">
                      <WellnessScene3D variant="hero" compact className="border border-white/70 dark:border-white/10" />
                      <div className="landing-orbit-metrics pointer-events-none">
                        {orbitMetrics.map((metric, index) => (
                          <motion.div
                            key={metric.label}
                            className={`landing-orbit-chip landing-orbit-chip-${index + 1}`}
                            animate={prefersReducedMotion ? {} : { y: [0, index % 2 ? -8 : 8, 0], scale: [1, 1.04, 1] }}
                            transition={{ duration: 4.8 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
                          >
                            <span>{metric.label}</span>
                            <strong>{metric.value}</strong>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-300">{t('landing.board.recovery')}</p>
                          <p className="landing-display mt-2 text-5xl font-bold">82</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-3">
                          <Activity className="h-6 w-6 text-cyan-300" />
                        </div>
                      </div>
                      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '82%' }}
                          transition={{ duration: 1.3, delay: 0.7 }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400"
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                        <span>{t('landing.board.sleepRhythm')}</span>
                        <span>{t('landing.board.stressEasing')}</span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/60">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-sky-100 p-3 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                            <Moon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('landing.board.sleepSprint')}</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{t('landing.board.sleepSprintStatus')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/60">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <BookHeart className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('landing.board.journalThemes')}</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{t('landing.board.journalThemesValue')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 dark:border-white/10 dark:bg-slate-900/60">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="font-semibold text-slate-900 dark:text-white">{t('landing.board.flowTitle')}</p>
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                          {t('landing.board.flowBadge')}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {t('landing.board.flowSteps').map((item, index) => (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + index * 0.12 }}
                            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/90 p-3 dark:border-white/5 dark:bg-white/5"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-xs font-bold text-white">
                              {index + 1}
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-200">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-500 to-sky-600 p-5 text-white shadow-lg shadow-sky-500/25 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-cyan-100">{t('landing.board.ragLabel')}</p>
                          <p className="mt-1 text-lg font-semibold">{t('landing.board.ragTitle')}</p>
                        </div>
                        <Wind className="h-6 w-6 text-cyan-100" />
                      </div>
                      <p className="mt-4 text-sm leading-6 text-cyan-50">
                        {t('landing.board.ragDescription')}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={prefersReducedMotion ? {} : { y: [0, -8, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-3 top-20 hidden rounded-3xl border border-white/70 bg-white/90 px-4 py-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 xl:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-fuchsia-100 p-3 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('landing.board.genAIBubbleTitle')}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('landing.board.genAIBubbleDetail')}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={prefersReducedMotion ? {} : { y: [0, 10, 0] }}
                  transition={{ duration: 6.1, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                  className="absolute -left-3 bottom-10 hidden rounded-3xl border border-white/70 bg-white/90 px-4 py-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 xl:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('landing.board.programsBubbleTitle')}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('landing.board.programsBubbleDetail')}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="mx-auto mt-14 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.75 }}
              className="landing-life-showcase mb-10"
            >
              <div className="landing-life-copy">
                <p>Realistic care experience</p>
                <h2>Built to feel warm, personal, and trustworthy.</h2>
                <span>
                  New layered 3D cards, lifelike wellness scenes, and soft motion help every visitor understand the product faster.
                </span>
              </div>
              <div className="landing-life-grid">
                {realisticPanels.map((panel, index) => (
                  <motion.article
                    key={panel.title}
                    className={`landing-life-card ${panel.className}`}
                    animate={prefersReducedMotion ? {} : { y: [0, index === 1 ? -12 : 12, 0], rotateY: [0, index === 1 ? 4 : -4, 0] }}
                    transition={{ duration: 7 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 }}
                  >
                    <div className="landing-life-photo" />
                    <div className="landing-life-glass">
                      <strong>{panel.mood}</strong>
                      <span>{panel.title}</span>
                    </div>
                    <h3>{panel.title}</h3>
                    <p>{panel.detail}</p>
                  </motion.article>
                ))}
              </div>
            </motion.div>

            <div className="overflow-hidden rounded-full border border-white/70 bg-white/65 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
              <div className="landing-marquee flex min-w-max items-center gap-3 px-4">
                {[...marqueeKeys, ...marqueeKeys].map((itemKey, index) => (
                  <div key={`${itemKey}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                    {t(itemKey)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="mb-12 grid gap-8 lg:grid-cols-[0.85fr,1.15fr]"
            >
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">{t('landing.whyLabel')}</p>
                <h2 className="landing-display text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">
                  {t('landing.whyTitle')}
                </h2>
              </div>
              <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {t('landing.whyDescription')}
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-5 lg:grid-cols-3"
            >
              {capabilityCards.map((card) => (
                <motion.div
                  key={card.titleKey}
                  variants={fadeInUp}
                  whileHover={{ y: -10, rotateX: 4, rotateY: -5, scale: 1.015 }}
                  className={`landing-feature-3d group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 ${card.span || ''}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.tone} opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.16]`} />
                  <div className="landing-feature-orbit" />
                  <div className="relative">
                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-lg`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <h3 className="landing-display text-2xl font-bold text-slate-950 dark:text-white">{t(card.titleKey)}</h3>
                    <p className="mt-3 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">{t(card.descriptionKey)}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-300">
                      {t('landing.exploreFlow')}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="experience" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.9fr,1.1fr]">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="landing-journey-portal rounded-[2rem] border border-white/70 bg-slate-950 p-7 text-white shadow-2xl shadow-slate-950/15 dark:border-white/10"
            >
              <div className="landing-journey-rings" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">{t('landing.journey.label')}</p>
              <h2 className="landing-display mt-4 text-4xl font-bold tracking-tight">{t('landing.journey.title')}</h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                {t('landing.journey.description')}
              </p>

              <div className="mt-8 space-y-4">
                {t('landing.journey.bullets').map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                    <span className="text-sm text-slate-100">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-5"
            >
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.titleKey}
                  variants={fadeInUp}
                  className="group rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/25">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                          {t('landing.journey.stepLabel')} {index + 1}
                        </span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                      </div>
                      <h3 className="landing-display mt-4 text-2xl font-bold text-slate-950 dark:text-white">{t(step.titleKey)}</h3>
                      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">{t(step.descriptionKey)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="stories" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.75 }}
              className="mb-12 text-center"
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">{t('landing.storiesLabel')}</p>
              <h2 className="landing-display text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">
                {t('landing.storiesTitle')}
              </h2>
            </motion.div>

            <div className="grid items-stretch gap-6 lg:grid-cols-[1.15fr,0.85fr]">
              <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStory}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.45 }}
                  >
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/25">
                      <Quote className="h-7 w-7" />
                    </div>
                    <p className="landing-display text-3xl font-bold leading-tight text-slate-950 dark:text-white">
                      &quot;{t(stories[activeStory].quoteKey)}&quot;
                    </p>
                    <div className="mt-8 flex items-center gap-3">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="mt-8">
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{t(stories[activeStory].nameKey)}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t(stories[activeStory].roleKey)}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                {stories.map((story, index) => {
                  const isActive = index === activeStory;

                  return (
                    <button
                      key={story.nameKey}
                      type="button"
                      onClick={() => setActiveStory(index)}
                      className={`w-full rounded-[2rem] border p-5 text-left transition-all ${
                        isActive
                          ? 'border-sky-200 bg-sky-50/80 shadow-lg shadow-sky-100/60 dark:border-sky-400/20 dark:bg-sky-500/10'
                          : 'border-white/70 bg-white/75 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/55'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="landing-display text-xl font-bold text-slate-950 dark:text-white">{t(story.focusKey)}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t(story.roleKey)}</p>
                        </div>
                        <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75 }}
            className="landing-cta-3d mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] border border-white/70 bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-slate-950/20 dark:border-white/10 md:px-10"
          >
            <div className="landing-cta-ribbon" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="grid items-center gap-8 lg:grid-cols-[1fr,auto]">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">{t('landing.cta.label')}</p>
                <h2 className="landing-display text-4xl font-bold tracking-tight md:text-5xl">
                  {t('landing.cta.title')}
                </h2>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                  {t('landing.cta.description')}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base">
                  {t('common.joinMindCare')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full border-white/15 bg-white/10 px-7 py-4 text-base text-white hover:bg-white/15 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">
                  {t('common.returnToSignIn')}
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="px-4 pb-12 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/70 px-6 py-5 text-sm text-slate-500 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-400 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg shadow-cyan-500/20">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <p className="landing-display font-bold text-slate-900 dark:text-white">{t('common.appName')}</p>
                <p className="text-xs">{t('common.notMedicalCare')}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={() => scrollToSection('features')} className="transition-colors hover:text-sky-600 dark:hover:text-sky-300">
                {t('common.features')}
              </button>
              <button type="button" onClick={() => scrollToSection('experience')} className="transition-colors hover:text-sky-600 dark:hover:text-sky-300">
                {t('common.experience')}
              </button>
              <Link to="/register" className="transition-colors hover:text-sky-600 dark:hover:text-sky-300">
                {t('common.getStarted')}
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;
