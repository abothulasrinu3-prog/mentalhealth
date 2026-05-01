import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Coffee, Utensils, Droplets, Plus, Search, Target, Flame, Brain, Heart, Calculator } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { EMPTY_MEAL_FORM, estimateNutritionFromFood, getMealTypeFromTime } from '../utils/nutritionEstimator';
import PageExperience3D from '../components/PageExperience3D';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MEAL_NAME_SAMPLES = {
  breakfast: ['Oatmeal with berries', 'Scrambled eggs', 'Greek yogurt', 'Idli', 'Dosa'],
  lunch: ['Grilled chicken salad', 'Quinoa bowl', 'Dal rice', 'Paneer bowl', 'Turkey sandwich'],
  dinner: ['Salmon with vegetables', 'Biryani', 'Khichdi', 'Tofu stir-fry', 'Pasta'],
  snack: ['Apple', 'Mixed nuts', 'Protein shake', 'Fruit salad', 'Dark chocolate']
};

const NutritionTracker = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [integrationLoading, setIntegrationLoading] = useState(true);
  const [integrationError, setIntegrationError] = useState('');
  const [liveNutrition, setLiveNutrition] = useState(null);
  const [liveNutritionLoading, setLiveNutritionLoading] = useState(false);
  const [liveNutritionError, setLiveNutritionError] = useState('');
  const [recipeMatches, setRecipeMatches] = useState([]);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState('');
  const [nutritionGoals] = useState({
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
    water: 8
  });
  
  const [newMeal, setNewMeal] = useState(EMPTY_MEAL_FORM);

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: '#f59e0b' },
    { id: 'lunch', label: 'Lunch', icon: Utensils, color: '#10b981' },
    { id: 'dinner', label: 'Dinner', icon: Utensils, color: '#3b82f6' },
    { id: 'snack', label: 'Snack', icon: Apple, color: '#ef4444' }
  ];

  // Generate mock nutrition data
  useEffect(() => {
    generateMockData();
    fetchIntegrationStatus();
  }, []);

  useEffect(() => {
    setLiveNutrition(null);
    setLiveNutritionError('');
    setRecipeMatches([]);
    setRecipeError('');
  }, [newMeal.name, newMeal.weight]);

  const generateMockData = () => {
    const mockMeals = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      mealTypes.forEach(mealType => {
        const mealName = MEAL_NAME_SAMPLES[mealType.id][Math.floor(Math.random() * MEAL_NAME_SAMPLES[mealType.id].length)];
        const weight = 110 + Math.floor(Math.random() * 120);
        const nutrition = estimateNutritionFromFood(mealName, weight);
        
        mockMeals.push({
          id: mockMeals.length + 1,
          date: dateStr,
          name: mealName,
          type: mealType.id,
          weight: nutrition.weight,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          fiber: nutrition.fiber,
          sugar: nutrition.sugar,
          sodium: nutrition.sodium,
          nutrition_source: nutrition.sourceLabel,
          time: `${8 + mealTypes.indexOf(mealType) * 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          mood_before: 2 + Math.floor(Math.random() * 3),
          mood_after: 3 + Math.floor(Math.random() * 3)
        });
      });
    }

    setMeals(mockMeals);
    setLoading(false);
  };

  const fetchIntegrationStatus = async () => {
    try {
      setIntegrationLoading(true);
      const response = await axios.get(`${API_URL}/integrations/status`);
      setIntegrationStatus(response.data.data);
      setIntegrationError('');
    } catch (error) {
      setIntegrationStatus(null);
      setIntegrationError(error.response?.data?.message || 'Unable to load live provider status right now.');
    } finally {
      setIntegrationLoading(false);
    }
  };

  const handleLiveNutritionEstimate = async () => {
    if (!newMeal.name.trim() || !newMeal.weight) {
      return;
    }

    try {
      setLiveNutritionLoading(true);
      setLiveNutritionError('');
      const response = await axios.post(`${API_URL}/integrations/nutrition/analyze`, {
        foodName: newMeal.name.trim(),
        weight: newMeal.weight,
        provider: 'auto'
      });
      setLiveNutrition(response.data.data);
    } catch (error) {
      setLiveNutrition(null);
      setLiveNutritionError(error.response?.data?.message || 'Live nutrition lookup failed.');
    } finally {
      setLiveNutritionLoading(false);
    }
  };

  const handleRecipeSearch = async () => {
    if (!newMeal.name.trim()) {
      return;
    }

    try {
      setRecipeLoading(true);
      setRecipeError('');
      const response = await axios.get(`${API_URL}/integrations/nutrition/recipes`, {
        params: {
          query: newMeal.name.trim()
        }
      });
      setRecipeMatches(response.data.data || []);
    } catch (error) {
      setRecipeMatches([]);
      setRecipeError(error.response?.data?.message || 'Live recipe search failed.');
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleAddMeal = () => {
    if (!newMeal.name.trim() || !newMeal.weight) {
      return;
    }

    const nutritionEstimate = liveNutrition || estimateNutritionFromFood(newMeal.name, newMeal.weight);
    const inferredType = getMealTypeFromTime(newMeal.time);

    const meal = {
      id: meals.length + 1,
      name: newMeal.name.trim(),
      type: inferredType,
      weight: nutritionEstimate.weight,
      calories: nutritionEstimate.calories,
      protein: nutritionEstimate.protein,
      carbs: nutritionEstimate.carbs,
      fat: nutritionEstimate.fat,
      fiber: nutritionEstimate.fiber,
      sugar: nutritionEstimate.sugar,
      sodium: nutritionEstimate.sodium,
      nutrition_source: nutritionEstimate.sourceLabel,
      time: newMeal.time,
      mood_before: newMeal.mood_before,
      mood_after: newMeal.mood_before,
      date: selectedDate
    };
    
    setMeals([...meals, meal]);
    setShowAddForm(false);
    setNewMeal(EMPTY_MEAL_FORM);
  };

  const getDailyTotals = (date) => {
    const dayMeals = meals.filter(meal => meal.date === date);
    
    return dayMeals.reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat,
      fiber: totals.fiber + meal.fiber,
      sugar: totals.sugar + meal.sugar,
      sodium: totals.sodium + meal.sodium,
      mood_before: totals.mood_before + meal.mood_before,
      mood_after: totals.mood_after + meal.mood_after,
      count: totals.count + 1
    }), {
      calories: 0, protein: 0, carbs: 0, fat: 0, 
      fiber: 0, sugar: 0, sodium: 0, 
      mood_before: 0, mood_after: 0, count: 0
    });
  };

  const getMacronutrientBreakdown = () => {
    const totals = getDailyTotals(selectedDate);
    const total = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;

    if (!total) {
      return [
        { name: 'Protein', value: 0, color: '#10b981' },
        { name: 'Carbs', value: 0, color: '#f59e0b' },
        { name: 'Fat', value: 0, color: '#ef4444' }
      ];
    }
    
    return [
      { name: 'Protein', value: Math.round((totals.protein * 4 / total) * 100), color: '#10b981' },
      { name: 'Carbs', value: Math.round((totals.carbs * 4 / total) * 100), color: '#f59e0b' },
      { name: 'Fat', value: Math.round((totals.fat * 9 / total) * 100), color: '#ef4444' }
    ];
  };

  const getMoodImpact = () => {
    const moodData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayMeals = meals.filter(meal => meal.date === dateStr);
      
      if (dayMeals.length > 0) {
        const avgMoodBefore = dayMeals.reduce((sum, meal) => sum + meal.mood_before, 0) / dayMeals.length;
        const avgMoodAfter = dayMeals.reduce((sum, meal) => sum + meal.mood_after, 0) / dayMeals.length;
        const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
        
        moodData.push({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          moodBefore: Math.round(avgMoodBefore * 10) / 10,
          moodAfter: Math.round(avgMoodAfter * 10) / 10,
          calories: totalCalories
        });
      }
    }
    return moodData;
  };

  const filteredMeals = meals.filter(meal => 
    meal.date === selectedDate &&
    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nutritionPreview = useMemo(
    () => liveNutrition || estimateNutritionFromFood(newMeal.name, newMeal.weight),
    [liveNutrition, newMeal.name, newMeal.weight]
  );

  const inferredMealType = useMemo(
    () => mealTypes.find((mealType) => mealType.id === getMealTypeFromTime(newMeal.time)) || mealTypes[1],
    [mealTypes, newMeal.time]
  );

  const dailyTotals = getDailyTotals(selectedDate);
  const macroBreakdown = getMacronutrientBreakdown();
  const moodData = getMoodImpact();
  const nutritionProviders = integrationStatus?.nutrition?.providers || [];
  const liveNutritionProviders = nutritionProviders.filter((provider) => provider.live && provider.configured && provider.id !== 'spoonacular');
  const liveRecipeProvider = nutritionProviders.find((provider) => provider.id === 'spoonacular' && provider.configured);

  const getMealIcon = (type) => {
    const mealType = mealTypes.find(t => t.id === type);
    const Icon = mealType?.icon || Utensils;
    return <Icon className="w-5 h-5" style={{ color: mealType?.color }} />;
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto space-y-8">
        <PageExperience3D
          variant="nutrition"
          eyebrow="Food and mood"
          title="Nutrition Tracker"
          description="A more appetizing nutrition workspace with animated macros, live provider readiness, and food-mood feedback."
          metrics={['Macros', 'Recipes', 'Mood impact']}
        />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Apple className="w-8 h-8 text-green-500" />
              Nutrition Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor your diet and discover the connection between food and mood
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {integrationLoading ? (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  Checking live providers...
                </span>
              ) : (
                <>
                  {liveNutritionProviders.map((provider) => (
                    <span
                      key={provider.id}
                      className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      {provider.label} ready
                    </span>
                  ))}
                  {liveRecipeProvider && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Spoonacular recipe search ready
                    </span>
                  )}
                  {!liveNutritionProviders.length && !liveRecipeProvider && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      Using local nutrition estimates until API keys are configured
                    </span>
                  )}
                </>
              )}
            </div>
            {integrationError && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">{integrationError}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
            <motion.button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Add Meal
            </motion.button>
          </div>
        </div>

        {/* Daily Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Calories</span>
            </div>
            <div className="text-2xl font-bold">{dailyTotals.calories}</div>
            <div className="text-xs text-gray-500">of {nutritionGoals.calories} goal</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${Math.min((dailyTotals.calories / nutritionGoals.calories) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Protein</span>
            </div>
            <div className="text-2xl font-bold">{dailyTotals.protein}g</div>
            <div className="text-xs text-gray-500">of {nutritionGoals.protein}g goal</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min((dailyTotals.protein / nutritionGoals.protein) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Mood Change</span>
            </div>
            <div className="text-2xl font-bold">
              {dailyTotals.count > 0 ? 
                `+${Math.round((dailyTotals.mood_after - dailyTotals.mood_before) / dailyTotals.count * 10) / 10}` : 
                '0'
              }
            </div>
            <div className="text-xs text-gray-500">after eating</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Water</span>
            </div>
            <div className="text-2xl font-bold">6</div>
            <div className="text-xs text-gray-500">of {nutritionGoals.water} glasses</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${Math.min((6 / nutritionGoals.water) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Macronutrient Breakdown */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Macronutrients</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {macroBreakdown.map((macro) => (
                <div key={macro.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }} />
                  <span className="text-sm">{macro.name}: {macro.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mood vs Nutrition */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Mood & Nutrition Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Line type="monotone" dataKey="moodBefore" stroke="#ef4444" strokeWidth={2} name="Mood Before" />
                  <Line type="monotone" dataKey="moodAfter" stroke="#10b981" strokeWidth={2} name="Mood After" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Add Meal Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold mb-4">Add New Meal</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Food Item</label>
                  <input
                    type="text"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                    placeholder="e.g., Grilled chicken salad"
                    className="input-field"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Try foods like oats, paneer, biryani, apple, chicken breast, dosa, or rice.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Weight (g)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={newMeal.weight}
                    onChange={(e) => setNewMeal({...newMeal, weight: Number(e.target.value) || 0})}
                    className="input-field"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Calories and macros are calculated automatically from this weight.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newMeal.time}
                    onChange={(e) => setNewMeal({...newMeal, time: e.target.value})}
                    className="input-field"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Meal type auto-detected: <span className="font-medium text-gray-700 dark:text-gray-200">{inferredMealType.label}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mood Before (1-5)</label>
                  <select
                    value={newMeal.mood_before}
                    onChange={(e) => setNewMeal({...newMeal, mood_before: parseInt(e.target.value)})}
                    className="input-field"
                  >
                    <option value={1}>1 - Very Low</option>
                    <option value={2}>2 - Low</option>
                    <option value={3}>3 - Neutral</option>
                    <option value={4}>4 - Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      type="button"
                      onClick={handleLiveNutritionEstimate}
                      disabled={!newMeal.name.trim() || !newMeal.weight || !liveNutritionProviders.length || liveNutritionLoading}
                      className="btn-secondary disabled:opacity-50"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {liveNutritionLoading ? 'Checking live nutrition...' : 'Use Live Nutrition'}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleRecipeSearch}
                      disabled={!newMeal.name.trim() || !liveRecipeProvider || recipeLoading}
                      className="btn-secondary disabled:opacity-50"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {recipeLoading ? 'Finding recipes...' : 'Find Recipe Ideas'}
                    </motion.button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Live nutrition uses Edamam or FatSecret through your backend. Recipe ideas use Spoonacular when configured.
                  </p>
                  {liveNutritionError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-300">{liveNutritionError}</p>
                  )}
                  {recipeError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-300">{recipeError}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-green-200 bg-green-50/70 p-4 md:col-span-2 dark:border-green-800 dark:bg-green-900/20">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100">Estimated Nutrition</p>
                      <p className="mt-1 text-sm text-green-800/80 dark:text-green-200/80">{nutritionPreview.sourceLabel}</p>
                      {newMeal.name.trim() && (
                        <p className="mt-2 text-xs text-green-900/80 dark:text-green-200/80">
                          Smart match: {nutritionPreview.profileName} for {nutritionPreview.weight}g
                        </p>
                      )}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-green-600 shadow-sm dark:bg-slate-900/70">
                      <Calculator className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-xl bg-white/80 p-3 shadow-sm dark:bg-slate-900/70">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Calories</p>
                      <p className="mt-1 text-lg font-semibold">{nutritionPreview.calories}</p>
                    </div>
                    <div className="rounded-xl bg-white/80 p-3 shadow-sm dark:bg-slate-900/70">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
                      <p className="mt-1 text-lg font-semibold">{nutritionPreview.protein}g</p>
                    </div>
                    <div className="rounded-xl bg-white/80 p-3 shadow-sm dark:bg-slate-900/70">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
                      <p className="mt-1 text-lg font-semibold">{nutritionPreview.carbs}g</p>
                    </div>
                    <div className="rounded-xl bg-white/80 p-3 shadow-sm dark:bg-slate-900/70">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Fat</p>
                      <p className="mt-1 text-lg font-semibold">{nutritionPreview.fat}g</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-900/60">Fiber: {nutritionPreview.fiber}g</div>
                    <div className="rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-900/60">Sugar: {nutritionPreview.sugar}g</div>
                    <div className="rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-900/60">Sodium: {nutritionPreview.sodium}mg</div>
                  </div>
                </div>
                {recipeMatches.length > 0 && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 md:col-span-2 dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Live Recipe Suggestions</p>
                        <p className="mt-1 text-sm text-blue-800/80 dark:text-blue-200/80">
                          Spoonacular suggestions for "{newMeal.name.trim()}"
                        </p>
                      </div>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-slate-900/70 dark:text-blue-300">
                        {recipeMatches.length} results
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {recipeMatches.slice(0, 4).map((recipe) => (
                        <a
                          key={recipe.id}
                          href={recipe.sourceUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-white/80 p-4 shadow-sm transition hover:shadow-md dark:bg-slate-900/70"
                        >
                          <p className="font-semibold text-gray-900 dark:text-white">{recipe.title}</p>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {recipe.calories} kcal • P {recipe.protein}g • C {recipe.carbs}g • F {recipe.fat}g
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : 'Time unavailable'}
                            {recipe.servings ? ` • ${recipe.servings} servings` : ''}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <motion.button
                  onClick={handleAddMeal}
                  disabled={!newMeal.name.trim() || !newMeal.weight}
                  className="btn-primary disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Meal
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewMeal(EMPTY_MEAL_FORM);
                  }}
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

        {/* Today's Meals */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Meals</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search meals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredMeals.map((meal, index) => (
              <motion.div
                key={meal.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {getMealIcon(meal.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{meal.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {meal.time} • {mealTypes.find(t => t.id === meal.type)?.label}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-medium">{meal.calories} cal</span>
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fat}g</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Mood:</span>
                      <span className="text-red-500">{meal.mood_before}</span>
                      <span>→</span>
                      <span className="text-green-500">{meal.mood_after}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {meal.mood_after > meal.mood_before ? '😊 Improved' : 
                       meal.mood_after < meal.mood_before ? '😔 Declined' : '😐 Same'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredMeals.length === 0 && (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No meals logged for this day yet</p>
            </div>
          )}
        </div>

        {/* Nutrition Insights */}
        <div className="glass-card p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Nutrition Insights
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700 dark:text-green-300">Mood-Food Connection</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• High-protein meals show consistent mood improvement</li>
                <li>• Balanced macronutrients correlate with stable energy</li>
                <li>• Regular meal timing helps maintain mood stability</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Recommendations</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Include protein with every meal for sustained energy</li>
                <li>• Focus on whole foods over processed options</li>
                <li>• Stay hydrated to support mental clarity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default NutritionTracker;
