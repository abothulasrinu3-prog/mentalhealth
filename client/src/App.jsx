import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import LiveLanguageBridge from './components/LiveLanguageBridge';
import ProtectedRoute from './components/ProtectedRoute';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MoodTracker = lazy(() => import('./pages/MoodTracker'));
const Journal = lazy(() => import('./pages/Journal'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Suggestions = lazy(() => import('./pages/Suggestions'));
const Programs = lazy(() => import('./pages/Programs'));
const WeeklyReview = lazy(() => import('./pages/WeeklyReview'));
const DailyAffirmations = lazy(() => import('./pages/DailyAffirmations'));
const DreamJournal = lazy(() => import('./pages/DreamJournal'));
const FamilySharing = lazy(() => import('./pages/FamilySharing'));
const RecoveryPlanner = lazy(() => import('./pages/RecoveryPlanner'));
const OfflineMode = lazy(() => import('./pages/OfflineMode'));
const TriggerInsights = lazy(() => import('./pages/TriggerInsights'));
const AutoDarkMode = lazy(() => import('./pages/AutoDarkMode'));
const Profile = lazy(() => import('./pages/Profile'));
const Emergency = lazy(() => import('./pages/Emergency'));
const Breathing = lazy(() => import('./pages/Breathing'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const SleepAnalysis = lazy(() => import('./pages/SleepAnalysis'));
const MedicationReminders = lazy(() => import('./pages/MedicationReminders'));
const Community = lazy(() => import('./pages/Community'));
const TherapistMatching = lazy(() => import('./pages/TherapistMatching'));
const HabitTracker = lazy(() => import('./pages/HabitTracker'));
const WeatherCorrelation = lazy(() => import('./pages/WeatherCorrelation'));
const PeriodTracker = lazy(() => import('./pages/PeriodTracker'));
const NutritionTracker = lazy(() => import('./pages/NutritionTracker'));
const WorkoutPlanner = lazy(() => import('./pages/WorkoutPlanner'));
const DataExport = lazy(() => import('./pages/DataExport'));
const MindfulnessGames = lazy(() => import('./pages/MindfulnessGames'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const CareIntelligence = lazy(() => import('./pages/CareIntelligence'));
const BiometricLogin = lazy(() => import('./pages/BiometricLogin'));

const RouteLoader = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loadingMindCare')}</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LiveLanguageBridge />
        <AuthProvider>
          <Router>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/mood-tracker" element={<MoodTracker />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/ai-insights" element={<AIInsights />} />
                    <Route path="/care-intelligence" element={<CareIntelligence />} />
                    <Route path="/programs" element={<Programs />} />
                    <Route path="/suggestions" element={<Suggestions />} />
                    <Route path="/weekly-review" element={<WeeklyReview />} />
                    <Route path="/daily-affirmations" element={<DailyAffirmations />} />
                    <Route path="/dream-journal" element={<DreamJournal />} />
                    <Route path="/family-sharing" element={<FamilySharing />} />
                    <Route path="/recovery-planner" element={<RecoveryPlanner />} />
                    <Route path="/offline-mode" element={<OfflineMode />} />
                    <Route path="/trigger-insights" element={<TriggerInsights />} />
                    <Route path="/auto-dark-mode" element={<AutoDarkMode />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/emergency" element={<Emergency />} />
                    <Route path="/breathing" element={<Breathing />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/sleep-analysis" element={<SleepAnalysis />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/medication-reminders" element={<MedicationReminders />} />
                    <Route path="/habit-tracker" element={<HabitTracker />} />
                    <Route path="/therapist-matching" element={<TherapistMatching />} />
                    <Route path="/weather-correlation" element={<WeatherCorrelation />} />
                    <Route path="/nutrition-tracker" element={<NutritionTracker />} />
                    <Route path="/period-tracker" element={<PeriodTracker />} />
                    <Route path="/data-export" element={<DataExport />} />
                    <Route path="/workout-planner" element={<WorkoutPlanner />} />
                    <Route path="/mindfulness-games" element={<MindfulnessGames />} />
                    <Route path="/progress-photos" element={<Navigate to="/weekly-review" replace />} />
                    <Route path="/smart-watch" element={<Navigate to="/recovery-planner" replace />} />
                    <Route path="/biometric-login" element={<BiometricLogin />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
