import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Smile, BookHeart, BarChart3, Sparkles, UserCircle, Siren, Wind, Bot, Moon, Pill, Users, Stethoscope, Target, Cloud, Calendar, Apple, Dumbbell, Download, Brain, Sun, Heart, Wifi, Settings, TrendingUp, Shield, Grid3X3, X, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
  { to: '/mood-tracker', icon: Smile, labelKey: 'sidebar.mood' },
  { to: '/journal', icon: BookHeart, labelKey: 'sidebar.journal' },
  { to: '/ai-insights', icon: Brain, labelKey: 'sidebar.aiInsights' },
  { to: '/care-intelligence', icon: Shield, labelKey: 'sidebar.careIntelligence' },
  { to: '/smart-timetable', icon: Clock, labelKey: 'sidebar.smartTimetable' },
  { to: '/programs', icon: Calendar, labelKey: 'sidebar.programs' },
  { to: '/community', icon: Users, labelKey: 'sidebar.community' },
  { to: '/therapist-matching', icon: Stethoscope, labelKey: 'sidebar.findTherapist' },
  { to: '/habit-tracker', icon: Target, labelKey: 'sidebar.habits' },
  { to: '/weather-correlation', icon: Cloud, labelKey: 'sidebar.weatherMood' },
  { to: '/period-tracker', icon: Calendar, labelKey: 'sidebar.periodTracker' },
  { to: '/nutrition-tracker', icon: Apple, labelKey: 'sidebar.nutrition' },
  { to: '/workout-planner', icon: Dumbbell, labelKey: 'sidebar.workouts' },
  { to: '/mindfulness-games', icon: Brain, labelKey: 'sidebar.mindfulness' },
  { to: '/data-export', icon: Download, labelKey: 'sidebar.exportData' },
  { to: '/analytics', icon: BarChart3, labelKey: 'sidebar.analytics' },
  { to: '/suggestions', icon: Sparkles, labelKey: 'sidebar.aiSuggestions' },
  { to: '/chatbot', icon: Bot, labelKey: 'sidebar.genAIStudio' },
  { to: '/sleep-analysis', icon: Moon, labelKey: 'sidebar.sleepAnalysis' },
  { to: '/medication-reminders', icon: Pill, labelKey: 'sidebar.medications' },
  { to: '/breathing', icon: Wind, labelKey: 'sidebar.breathing' },
  { to: '/emergency', icon: Siren, labelKey: 'sidebar.emergency' },
  { to: '/weekly-review', icon: TrendingUp, labelKey: 'sidebar.weeklyReview' },
  { to: '/daily-affirmations', icon: Sun, labelKey: 'sidebar.affirmations' },
  { to: '/dream-journal', icon: Moon, labelKey: 'sidebar.dreamJournal' },
  { to: '/family-sharing', icon: Heart, labelKey: 'sidebar.familySharing' },
  { to: '/recovery-planner', icon: Heart, labelKey: 'sidebar.recoveryPlanner' },
  { to: '/offline-mode', icon: Wifi, labelKey: 'sidebar.offlineMode' },
  { to: '/trigger-insights', icon: BarChart3, labelKey: 'sidebar.triggerInsights' },
  { to: '/auto-dark-mode', icon: Settings, labelKey: 'sidebar.darkMode' },
  { to: '/profile', icon: UserCircle, labelKey: 'sidebar.profile' },
];

const Sidebar = () => {
  const { t } = useLanguage();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileNavItems = navItems.filter((item) =>
    ['/dashboard', '/mood-tracker', '/journal', '/ai-insights'].includes(item.to)
  );

  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            {t('sidebar.needHelp')}
          </p>
          <NavLink
            to="/emergency"
            className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <Siren className="w-4 h-4" />
            {t('sidebar.emergencySupport')}
          </NavLink>
        </div>
      </aside>

      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div
            className="absolute inset-x-3 bottom-20 max-h-[72vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">All features</p>
              <button
                type="button"
                onClick={() => setShowMobileMenu(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMobileMenu(false)}
                  className={({ isActive }) =>
                    `flex min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{t(item.labelKey)}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-2 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden dark:border-gray-700 dark:bg-gray-900/95">
        <div className="grid grid-cols-5 gap-1">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="w-full truncate text-center">{t(item.labelKey).replace('AI ', '')}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setShowMobileMenu(true)}
            className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Grid3X3 className="h-5 w-5 flex-shrink-0" />
            <span className="w-full truncate text-center">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
