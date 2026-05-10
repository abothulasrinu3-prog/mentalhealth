const LOCAL_MOOD_KEY = 'mindcare_local_moods';

export const readLocalMoods = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_MOOD_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveLocalMood = (entry) => {
  const createdAt = new Date().toISOString();
  const nextEntry = {
    ...entry,
    _id: `local-mood-${Date.now()}`,
    createdAt,
    updatedAt: createdAt
  };

  const moods = [nextEntry, ...readLocalMoods()];
  localStorage.setItem(LOCAL_MOOD_KEY, JSON.stringify(moods));
  return nextEntry;
};

export const getLocalMoodHistory = (days = 7) => {
  const cutoff = Date.now() - Number(days) * 24 * 60 * 60 * 1000;
  return readLocalMoods().filter((mood) => new Date(mood.createdAt).getTime() >= cutoff);
};

export const getLocalTodayMood = () => {
  const today = new Date().toDateString();
  return readLocalMoods().find((mood) => new Date(mood.createdAt).toDateString() === today) || null;
};

export const getLocalMoodStats = (days = 7) => {
  const moods = getLocalMoodHistory(days);
  if (!moods.length) {
    return null;
  }

  const averageMood =
    moods.reduce((total, mood) => total + Number(mood.moodScore || 0), 0) / moods.length;
  const averageStress =
    moods.reduce((total, mood) => total + Number(mood.stressLevel || 0), 0) / moods.length;
  const averageSleep =
    moods.reduce((total, mood) => total + Number(mood.sleepHours || 0), 0) / moods.length;

  return {
    totalEntries: moods.length,
    averageMood: Math.round(averageMood * 10) / 10,
    averageStress: Math.round(averageStress * 10) / 10,
    averageSleep: Math.round(averageSleep * 10) / 10,
    currentStreak: moods.length,
    moodImprovement: 0
  };
};
