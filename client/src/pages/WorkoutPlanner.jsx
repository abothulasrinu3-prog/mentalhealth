import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Calendar, Clock, Flame, Target, Plus, Play, Check, X, TrendingUp, Award, Heart, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const WorkoutPlanner = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    type: 'strength',
    duration: 30,
    difficulty: 'intermediate',
    exercises: [],
    schedule: ['monday', 'wednesday', 'friday'],
    goals: ['muscle-gain', 'strength']
  });

  const workoutTypes = [
    { id: 'strength', label: 'Strength Training', icon: Dumbbell, color: '#ef4444' },
    { id: 'cardio', label: 'Cardio', icon: Flame, color: '#f59e0b' },
    { id: 'flexibility', label: 'Flexibility', icon: Heart, color: '#10b981' },
    { id: 'hiit', label: 'HIIT', icon: Brain, color: '#8b5cf6' },
    { id: 'yoga', label: 'Yoga', icon: Heart, color: '#06b6d4' },
    { id: 'sports', label: 'Sports', icon: Target, color: '#3b82f6' }
  ];

  const exerciseCategories = {
    strength: ['Push-ups', 'Pull-ups', 'Squats', 'Deadlifts', 'Bench Press', 'Shoulder Press'],
    cardio: ['Running', 'Cycling', 'Swimming', 'Jumping Jacks', 'Burpees', 'Mountain Climbers'],
    flexibility: ['Stretching', 'Yoga Poses', 'Pilates', 'Foam Rolling', 'Dynamic Stretches'],
    hiit: ['Sprints', 'Kettlebell Swings', 'Box Jumps', 'Battle Ropes', 'Rowing'],
    yoga: ['Sun Salutation', 'Warrior Poses', 'Tree Pose', 'Downward Dog', 'Child Pose'],
    sports: ['Basketball', 'Soccer', 'Tennis', 'Swimming', 'Running', 'Cycling']
  };

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const goals = ['weight-loss', 'muscle-gain', 'strength', 'endurance', 'flexibility', 'mental-health'];
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Generate mock workout data
  useEffect(() => {
    generateMockWorkouts();
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const generateMockWorkouts = () => {
    const mockWorkouts = [
      {
        id: 1,
        name: 'Upper Body Strength',
        type: 'strength',
        duration: 45,
        difficulty: 'intermediate',
        exercises: ['Push-ups', 'Pull-ups', 'Bench Press', 'Shoulder Press'],
        schedule: ['monday', 'thursday'],
        goals: ['muscle-gain', 'strength'],
        completed: true,
        completedDates: ['2024-01-15', '2024-01-18'],
        calories: 300,
        mood_before: 3,
        mood_after: 4,
        notes: 'Felt strong today!'
      },
      {
        id: 2,
        name: 'Morning Yoga Flow',
        type: 'yoga',
        duration: 30,
        difficulty: 'beginner',
        exercises: ['Sun Salutation', 'Warrior Poses', 'Tree Pose'],
        schedule: ['tuesday', 'saturday'],
        goals: ['flexibility', 'mental-health'],
        completed: false,
        completedDates: ['2024-01-16'],
        calories: 150,
        mood_before: 2,
        mood_after: 5,
        notes: 'Very relaxing start to the day'
      },
      {
        id: 3,
        name: 'HIIT Cardio Blast',
        type: 'hiit',
        duration: 25,
        difficulty: 'advanced',
        exercises: ['Sprints', 'Burpees', 'Kettlebell Swings'],
        schedule: ['wednesday', 'friday'],
        goals: ['weight-loss', 'endurance'],
        completed: true,
        completedDates: ['2024-01-17', '2024-01-19'],
        calories: 400,
        mood_before: 3,
        mood_after: 5,
        notes: 'Intense but energizing!'
      },
      {
        id: 4,
        name: 'Evening Stretch',
        type: 'flexibility',
        duration: 20,
        difficulty: 'beginner',
        exercises: ['Stretching', 'Foam Rolling', 'Dynamic Stretches'],
        schedule: ['sunday'],
        goals: ['flexibility', 'mental-health'],
        completed: false,
        completedDates: [],
        calories: 100,
        mood_before: 3,
        mood_after: 4,
        notes: ''
      }
    ];
    
    setWorkouts(mockWorkouts);
    setLoading(false);
  };

  const handleCreateWorkout = () => {
    const workout = {
      ...newWorkout,
      id: workouts.length + 1,
      completed: false,
      completedDates: [],
      calories: Math.round(newWorkout.duration * 8),
      mood_before: 3,
      mood_after: 4,
      notes: ''
    };
    
    setWorkouts([...workouts, workout]);
    setShowCreateForm(false);
    setNewWorkout({
      name: '',
      type: 'strength',
      duration: 30,
      difficulty: 'intermediate',
      exercises: [],
      schedule: ['monday', 'wednesday', 'friday'],
      goals: ['muscle-gain', 'strength']
    });
  };

  const startWorkout = (workout) => {
    setActiveWorkout(workout);
    setWorkoutTimer(0);
    setIsTimerRunning(true);
  };

  const completeWorkout = () => {
    if (activeWorkout) {
      const updatedWorkout = {
        ...activeWorkout,
        completed: true,
        completedDates: [...activeWorkout.completedDates, new Date().toISOString().split('T')[0]]
      };
      
      setWorkouts(workouts.map(w => w.id === activeWorkout.id ? updatedWorkout : w));
      setActiveWorkout(null);
      setIsTimerRunning(false);
      setWorkoutTimer(0);
    }
  };

  const getWeeklyStats = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekWorkouts = workouts.filter(workout => 
      workout.completed && workout.completedDates.some(date => {
        const workoutDate = new Date(date);
        return workoutDate >= weekStart && workoutDate <= today;
      })
    );
    
    return {
      totalWorkouts: weekWorkouts.length,
      totalCalories: weekWorkouts.reduce((sum, w) => sum + w.calories, 0),
      totalMinutes: weekWorkouts.reduce((sum, w) => sum + w.duration, 0),
      avgMoodImprovement: weekWorkouts.length > 0 ? 
        Math.round(weekWorkouts.reduce((sum, w) => sum + (w.mood_after - w.mood_before), 0) / weekWorkouts.length * 10) / 10 : 0
    };
  };

  const getWeeklySchedule = () => {
    return weekDays.map(day => {
      const dayWorkouts = workouts.filter(workout => workout.schedule.includes(day));
      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        workouts: dayWorkouts,
        totalDuration: dayWorkouts.reduce((sum, w) => sum + w.duration, 0)
      };
    });
  };

  const getProgressData = () => {
    const last4Weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekWorkouts = workouts.filter(workout => 
        workout.completed && workout.completedDates.some(date => {
          const workoutDate = new Date(date);
          return workoutDate >= weekStart && workoutDate <= weekEnd;
        })
      );
      
      last4Weeks.push({
        week: `Week ${4 - i}`,
        workouts: weekWorkouts.length,
        calories: weekWorkouts.reduce((sum, w) => sum + w.calories, 0)
      });
    }
    return last4Weeks;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorkoutIcon = (type) => {
    const workoutType = workoutTypes.find(t => t.id === type);
    const Icon = workoutType?.icon || Dumbbell;
    return <Icon className="w-5 h-5" style={{ color: workoutType?.color }} />;
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
    );
  }

  const weeklyStats = getWeeklyStats();
  const weeklySchedule = getWeeklySchedule();
  const progressData = getProgressData();

  return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Dumbbell className="w-8 h-8 text-red-500" />
              Workout Planner
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create personalized workout plans and track your fitness journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Create Workout
            </motion.button>
          </div>
        </div>

        {/* Active Workout Timer */}
        <AnimatePresence>
          {activeWorkout && (
            <motion.div 
              className="glass-card p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Active Workout: {activeWorkout.name}</h3>
                  <div className="flex items-center gap-4">
                    {getWorkoutIcon(activeWorkout.type)}
                    <span className="text-sm text-gray-600">
                      {activeWorkout.exercises.length} exercises • {activeWorkout.duration} min
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {formatTime(workoutTimer)}
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isTimerRunning ? <X className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isTimerRunning ? 'Pause' : 'Resume'}
                    </motion.button>
                    <motion.button
                      onClick={completeWorkout}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Check className="w-4 h-4" />
                      Complete
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Workouts</span>
            </div>
            <div className="text-2xl font-bold">{weeklyStats.totalWorkouts}</div>
            <div className="text-xs text-gray-500">this week</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Calories</span>
            </div>
            <div className="text-2xl font-bold">{weeklyStats.totalCalories}</div>
            <div className="text-xs text-gray-500">burned this week</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
            </div>
            <div className="text-2xl font-bold">{weeklyStats.totalMinutes}</div>
            <div className="text-xs text-gray-500">minutes this week</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-5 h-5 text-pink-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Mood Boost</span>
            </div>
            <div className="text-2xl font-bold">+{weeklyStats.avgMoodImprovement}</div>
            <div className="text-xs text-gray-500">average improvement</div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
          <div className="grid grid-cols-7 gap-2">
            {weeklySchedule.map((day, index) => (
              <motion.div
                key={day.day}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {day.day}
                </div>
                <div className="space-y-1">
                  {day.workouts.map(workout => (
                    <motion.div
                      key={workout.id}
                      className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {getWorkoutIcon(workout.type)}
                      <div className="font-medium mt-1">{workout.duration}m</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">4-Week Progress</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="workouts" fill="#ef4444" name="Workouts" />
                <Bar dataKey="calories" fill="#f59e0b" name="Calories" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Create Workout Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Workout</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Workout Name</label>
                  <input
                    type="text"
                    value={newWorkout.name}
                    onChange={(e) => setNewWorkout({...newWorkout, name: e.target.value})}
                    placeholder="e.g., Morning Strength Training"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newWorkout.type}
                    onChange={(e) => setNewWorkout({...newWorkout, type: e.target.value, exercises: []})}
                    className="input-field"
                  >
                    {workoutTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout({...newWorkout, duration: parseInt(e.target.value)})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={newWorkout.difficulty}
                    onChange={(e) => setNewWorkout({...newWorkout, difficulty: e.target.value})}
                    className="input-field"
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Exercises</label>
                  <select
                    multiple
                    value={newWorkout.exercises}
                    onChange={(e) => setNewWorkout({...newWorkout, exercises: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="input-field"
                    size={4}
                  >
                    {exerciseCategories[newWorkout.type]?.map(exercise => (
                      <option key={exercise} value={exercise}>{exercise}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Schedule</label>
                  <div className="space-y-2">
                    {weekDays.map(day => (
                      <label key={day} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newWorkout.schedule.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWorkout({...newWorkout, schedule: [...newWorkout.schedule, day]});
                            } else {
                              setNewWorkout({...newWorkout, schedule: newWorkout.schedule.filter(d => d !== day)});
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <motion.button
                  onClick={handleCreateWorkout}
                  disabled={!newWorkout.name.trim() || newWorkout.exercises.length === 0}
                  className="btn-primary disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Workout
                </motion.button>
                <motion.button
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workouts List */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Your Workouts</h3>
          <div className="space-y-4">
            {workouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {getWorkoutIcon(workout.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{workout.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workout.duration} min • {workout.difficulty} • {workout.exercises.length} exercises
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-medium">{workout.calories} cal</span>
                        <span className="text-gray-600">
                          Schedule: {workout.schedule.map(d => d.slice(0, 3)).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => startWorkout(workout)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </motion.button>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Mood:</span>
                        <span className="text-red-500">{workout.mood_before}</span>
                        <span>→</span>
                        <span className="text-green-500">{workout.mood_after}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {workout.completedDates.length} completed
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fitness Tips */}
        <div className="glass-card p-6 bg-gradient-to-br from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Fitness & Mental Health Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-red-700 dark:text-red-300">Exercise Benefits</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Regular exercise reduces anxiety and depression</li>
                <li>• Physical activity boosts endorphins and mood</li>
                <li>• Strength training improves confidence and body image</li>
                <li>• Consistency is more important than intensity</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Getting Started</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Start with 10-15 minute sessions</li>
                <li>• Choose activities you actually enjoy</li>
                <li>• Schedule workouts like appointments</li>
                <li>• Track progress to stay motivated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default WorkoutPlanner;
