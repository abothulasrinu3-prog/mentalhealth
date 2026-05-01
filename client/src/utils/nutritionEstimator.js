export const EMPTY_MEAL_FORM = {
  name: '',
  weight: 150,
  time: '12:00',
  mood_before: 3
};

const DEFAULT_FOOD_PROFILE = {
  name: 'Balanced meal',
  aliases: ['balanced meal', 'mixed meal', 'regular meal'],
  per100g: {
    calories: 150,
    protein: 8,
    carbs: 16,
    fat: 6,
    fiber: 2,
    sugar: 3,
    sodium: 220
  }
};

const FOOD_LIBRARY = [
  { name: 'Grilled chicken salad', aliases: ['grilled chicken salad', 'chicken salad'], per100g: { calories: 140, protein: 16, carbs: 6, fat: 5, fiber: 2, sugar: 3, sodium: 220 } },
  { name: 'Chicken breast', aliases: ['chicken breast', 'grilled chicken', 'chicken'], per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 } },
  { name: 'Oatmeal', aliases: ['oatmeal', 'oats', 'porridge'], per100g: { calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7, sugar: 0.5, sodium: 49 } },
  { name: 'Scrambled eggs', aliases: ['scrambled eggs', 'eggs', 'egg scramble'], per100g: { calories: 148, protein: 10, carbs: 1.6, fat: 10.9, fiber: 0, sugar: 1.5, sodium: 140 } },
  { name: 'Greek yogurt', aliases: ['greek yogurt', 'yogurt', 'curd', 'dahi'], per100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2, sodium: 36 } },
  { name: 'Rice', aliases: ['rice', 'white rice', 'steamed rice'], per100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 } },
  { name: 'Quinoa bowl', aliases: ['quinoa', 'quinoa bowl'], per100g: { calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7 } },
  { name: 'Salmon', aliases: ['salmon', 'grilled salmon'], per100g: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59 } },
  { name: 'Paneer', aliases: ['paneer', 'paneer tikka', 'paneer curry'], per100g: { calories: 265, protein: 18, carbs: 3, fat: 21, fiber: 0, sugar: 2, sodium: 22 } },
  { name: 'Dal', aliases: ['dal', 'lentils', 'lentil curry'], per100g: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, sugar: 1.8, sodium: 2 } },
  { name: 'Roti', aliases: ['roti', 'chapati', 'phulka'], per100g: { calories: 297, protein: 9, carbs: 55, fat: 7, fiber: 7, sugar: 2, sodium: 250 } },
  { name: 'Idli', aliases: ['idli', 'idlis'], per100g: { calories: 146, protein: 4.5, carbs: 29, fat: 0.7, fiber: 1.5, sugar: 1, sodium: 180 } },
  { name: 'Dosa', aliases: ['dosa', 'masala dosa', 'plain dosa'], per100g: { calories: 184, protein: 4.5, carbs: 32, fat: 3.7, fiber: 1.2, sugar: 1.3, sodium: 220 } },
  { name: 'Biryani', aliases: ['biryani', 'chicken biryani', 'veg biryani'], per100g: { calories: 180, protein: 8, carbs: 20, fat: 8, fiber: 1.3, sugar: 1.7, sodium: 320 } },
  { name: 'Khichdi', aliases: ['khichdi', 'kichdi'], per100g: { calories: 105, protein: 3.6, carbs: 18.8, fat: 2, fiber: 2.5, sugar: 1, sodium: 120 } },
  { name: 'Turkey sandwich', aliases: ['turkey sandwich', 'sandwich'], per100g: { calories: 210, protein: 13, carbs: 24, fat: 7, fiber: 2.4, sugar: 4, sodium: 430 } },
  { name: 'Vegetable soup', aliases: ['vegetable soup', 'soup', 'tomato soup'], per100g: { calories: 36, protein: 1.5, carbs: 6, fat: 1, fiber: 1.2, sugar: 2.4, sodium: 240 } },
  { name: 'Pasta', aliases: ['pasta', 'spaghetti', 'pasta with tomato sauce'], per100g: { calories: 158, protein: 5.8, carbs: 31, fat: 0.9, fiber: 1.8, sugar: 1.1, sodium: 230 } },
  { name: 'Vegetable salad', aliases: ['vegetable salad', 'salad', 'green salad'], per100g: { calories: 33, protein: 2, carbs: 6, fat: 0.2, fiber: 2.2, sugar: 3.5, sodium: 65 } },
  { name: 'Fruit salad', aliases: ['fruit salad', 'mixed fruit'], per100g: { calories: 50, protein: 0.7, carbs: 13, fat: 0.2, fiber: 2.1, sugar: 10.5, sodium: 3 } },
  { name: 'Apple', aliases: ['apple'], per100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10.4, sodium: 1 } },
  { name: 'Banana', aliases: ['banana'], per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1 } },
  { name: 'Mixed nuts', aliases: ['mixed nuts', 'nuts', 'almonds', 'cashews'], per100g: { calories: 607, protein: 20, carbs: 21, fat: 54, fiber: 8, sugar: 4.7, sodium: 273 } },
  { name: 'Protein shake', aliases: ['protein shake', 'whey shake', 'shake'], per100g: { calories: 120, protein: 24, carbs: 4, fat: 2, fiber: 0.5, sugar: 2, sodium: 110 } },
  { name: 'Dark chocolate', aliases: ['dark chocolate', 'chocolate'], per100g: { calories: 546, protein: 4.9, carbs: 61, fat: 31, fiber: 7, sugar: 48, sodium: 24 } }
];

const normalizeText = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const roundMacro = (value) => Math.round(value * 10) / 10;

export const getMealTypeFromTime = (time) => {
  const [hours = 12] = time.split(':').map(Number);

  if (hours >= 5 && hours < 11) {
    return 'breakfast';
  }

  if (hours >= 11 && hours < 16) {
    return 'lunch';
  }

  if (hours >= 16 && hours < 19) {
    return 'snack';
  }

  return 'dinner';
};

const findFoodProfile = (foodName) => {
  const normalizedFood = normalizeText(foodName);

  if (!normalizedFood) {
    return { ...DEFAULT_FOOD_PROFILE, matchScore: 0 };
  }

  let bestMatch = { ...DEFAULT_FOOD_PROFILE, matchScore: 0 };

  FOOD_LIBRARY.forEach((food) => {
    const score = Math.max(
      ...food.aliases.map((alias) => {
        const normalizedAlias = normalizeText(alias);

        if (normalizedFood === normalizedAlias) {
          return 100;
        }

        if (normalizedFood.includes(normalizedAlias) || normalizedAlias.includes(normalizedFood)) {
          return 82;
        }

        const foodTokens = new Set(normalizedFood.split(' '));
        const aliasTokens = normalizedAlias.split(' ');
        const overlap = aliasTokens.filter((token) => foodTokens.has(token)).length;

        return overlap > 0 ? Math.round((overlap / aliasTokens.length) * 65) : 0;
      })
    );

    if (score > bestMatch.matchScore) {
      bestMatch = { ...food, matchScore: score };
    }
  });

  return bestMatch.matchScore >= 25 ? bestMatch : { ...DEFAULT_FOOD_PROFILE, matchScore: 0 };
};

export const estimateNutritionFromFood = (foodName, weightValue) => {
  const rawWeight = Math.max(Number(weightValue) || 0, 0);

  if (!foodName.trim()) {
    return {
      weight: rawWeight,
      profileName: 'No food selected',
      sourceLabel: 'Enter a food item to estimate calories and macros automatically.',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      matched: false
    };
  }

  const matchedProfile = findFoodProfile(foodName);
  const profile = matchedProfile.matchScore > 0 ? matchedProfile : DEFAULT_FOOD_PROFILE;
  const weight = Math.max(rawWeight, 100);
  const factor = weight / 100;

  return {
    weight,
    profileName: profile.name,
    sourceLabel:
      matchedProfile.matchScore > 0
        ? `Estimated from ${profile.name} nutrition data per 100g.`
        : 'Using a balanced meal estimate because this food is not in the smart list yet.',
    calories: Math.round(profile.per100g.calories * factor),
    protein: roundMacro(profile.per100g.protein * factor),
    carbs: roundMacro(profile.per100g.carbs * factor),
    fat: roundMacro(profile.per100g.fat * factor),
    fiber: roundMacro(profile.per100g.fiber * factor),
    sugar: roundMacro(profile.per100g.sugar * factor),
    sodium: Math.round(profile.per100g.sodium * factor),
    matched: matchedProfile.matchScore > 0
  };
};
