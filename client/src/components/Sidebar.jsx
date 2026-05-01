import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Smile, BookHeart, BarChart3, Sparkles, UserCircle, Siren, Wind, Bot, Moon, Pill, Users, Stethoscope, Target, Cloud, Calendar, Apple, Dumbbell, Download, Brain, Sun, Heart, Wifi, Settings, TrendingUp, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
  { to: '/mood-tracker', icon: Smile, labelKey: 'sidebar.mood' },
  { to: '/journal', icon: BookHeart, labelKey: 'sidebar.journal' },
  { to: '/ai-insights', icon: Brain, labelKey: 'sidebar.aiInsights' },
  { to: '/care-intelligence', icon: Shield, labelKey: 'sidebar.careIntelligence' },
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

  return (
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
  );
};

export default Sidebar;
