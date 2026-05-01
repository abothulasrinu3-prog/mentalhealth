import axios from 'axios';

const round = (value, digits = 1) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  const factor = 10 ** digits;
  return Math.round(numeric * factor) / factor;
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
};

const isConfigured = (value = '') => Boolean(String(value || '').trim());
const getMissingEnv = (keys = []) => keys.filter((key) => !isConfigured(process.env[key]));

const nutritionProviders = {
  edamam: {
    id: 'edamam',
    label: 'Edamam Nutrition Analysis API',
    requiredEnv: ['EDAMAM_APP_ID', 'EDAMAM_APP_KEY'],
    configured: isConfigured(process.env.EDAMAM_APP_ID) && isConfigured(process.env.EDAMAM_APP_KEY),
    missingEnv: getMissingEnv(['EDAMAM_APP_ID', 'EDAMAM_APP_KEY']),
    live: true,
    category: 'nutrition',
    docsUrl: 'https://developer.edamam.com/edamam-docs-nutrition-api',
    note: 'Uses the active Nutrition Analysis API rather than the retired Nutrition Data endpoint.'
  },
  fatsecret: {
    id: 'fatsecret',
    label: 'FatSecret Platform API',
    requiredEnv: ['FATSECRET_CLIENT_ID', 'FATSECRET_CLIENT_SECRET'],
    configured: isConfigured(process.env.FATSECRET_CLIENT_ID) && isConfigured(process.env.FATSECRET_CLIENT_SECRET),
    missingEnv: getMissingEnv(['FATSECRET_CLIENT_ID', 'FATSECRET_CLIENT_SECRET']),
    live: true,
    category: 'nutrition',
    docsUrl: 'https://platform.fatsecret.com/docs/guides/authentication',
    note: 'Server-side OAuth 2.0 search is supported for live food lookup.'
  },
  spoonacular: {
    id: 'spoonacular',
    label: 'Spoonacular API',
    requiredEnv: ['SPOONACULAR_API_KEY'],
    configured: isConfigured(process.env.SPOONACULAR_API_KEY),
    missingEnv: getMissingEnv(['SPOONACULAR_API_KEY']),
    live: true,
    category: 'nutrition',
    docsUrl: 'https://spoonacular.com/food-api/console',
    note: 'Best fit for recipe discovery, meal ideas, and nutrition-aware recipe search.'
  }
};

const wellnessProviders = {
  googleFit: {
    id: 'google-fit',
    label: 'Google Fit REST API',
    requiredEnv: ['GOOGLE_FIT_CLIENT_ID', 'GOOGLE_FIT_CLIENT_SECRET', 'GOOGLE_FIT_REDIRECT_URI'],
    configured:
      isConfigured(process.env.GOOGLE_FIT_CLIENT_ID) &&
      isConfigured(process.env.GOOGLE_FIT_CLIENT_SECRET) &&
      isConfigured(process.env.GOOGLE_FIT_REDIRECT_URI),
    missingEnv: getMissingEnv(['GOOGLE_FIT_CLIENT_ID', 'GOOGLE_FIT_CLIENT_SECRET', 'GOOGLE_FIT_REDIRECT_URI']),
    live: true,
    category: 'wearables',
    auth: 'oauth2',
    docsUrl: 'https://developers.google.com/fit/rest/v1/get-started',
    note: 'Web-ready through OAuth 2.0. Good for steps, heart rate, and sleep after consent.'
  },
  healthConnect: {
    id: 'health-connect',
    label: 'Health Connect',
    requiredEnv: [],
    configured: false,
    missingEnv: [],
    live: false,
    category: 'wearables',
    platform: 'android-only',
    docsUrl: 'https://developer.android.com/health-and-fitness/guides/health-connect/develop/get-started?hl=en',
    note: 'Android SDK integration only. It is not a browser API and cannot connect directly from this web app.'
  },
  t2MoodTracker: {
    id: 't2-mood-tracker',
    label: 'T2 Mood Tracker',
    requiredEnv: [],
    configured: false,
    missingEnv: [],
    live: false,
    category: 'mental-health',
    docsUrl: '',
    note: 'A public official API could not be verified, so it is not wired into the web app.'
  },
  moodscope: {
    id: 'moodscope',
    label: 'Moodscope',
    requiredEnv: [],
    configured: false,
    missingEnv: [],
    live: false,
    category: 'mental-health',
    docsUrl: 'https://www.moodscope.com/',
    note: 'The public site is available, but an official public developer API was not verified.'
  },
  ginger: {
    id: 'ginger',
    label: 'Ginger.io',
    requiredEnv: [],
    configured: false,
    missingEnv: [],
    live: false,
    category: 'mental-health',
    docsUrl: '',
    note: 'A public official developer API could not be verified for direct project integration.'
  }
};

const providerPriority = ['edamam', 'fatsecret', 'spoonacular'];

const fatSecretTokenCache = {
  accessToken: null,
  expiresAt: 0
};

const getConfiguredNutritionProvider = (preferred = 'auto') => {
  if (preferred && preferred !== 'auto' && nutritionProviders[preferred]?.configured) {
    return preferred;
  }

  return providerPriority.find((providerId) => nutritionProviders[providerId]?.configured) || null;
};

const getFatSecretToken = async () => {
  const now = Date.now();
  if (fatSecretTokenCache.accessToken && fatSecretTokenCache.expiresAt > now + 60_000) {
    return fatSecretTokenCache.accessToken;
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'basic'
  });

  const response = await axios.post('https://oauth.fatsecret.com/connect/token', params, {
    auth: {
      username: process.env.FATSECRET_CLIENT_ID,
      password: process.env.FATSECRET_CLIENT_SECRET
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 15000
  });

  fatSecretTokenCache.accessToken = response.data.access_token;
  fatSecretTokenCache.expiresAt = now + Number(response.data.expires_in || 0) * 1000;

  return fatSecretTokenCache.accessToken;
};

const mapNormalizedNutrition = ({
  provider,
  foodName,
  weight,
  calories,
  protein,
  carbs,
  fat,
  fiber,
  sugar,
  sodium,
  sourceLabel,
  profileName
}) => ({
  provider,
  profileName: profileName || foodName,
  itemName: foodName,
  weight: round(weight, 0),
  calories: round(calories, 0),
  protein: round(protein),
  carbs: round(carbs),
  fat: round(fat),
  fiber: round(fiber),
  sugar: round(sugar),
  sodium: round(sodium, 0),
  sourceLabel
});

const analyzeWithEdamam = async ({ foodName, weight }) => {
  const ingredientLine = `${round(weight, 0)} g ${foodName}`;
  const response = await axios.post(
    'https://api.edamam.com/api/nutrition-details',
    {
      title: foodName,
      ingr: [ingredientLine]
    },
    {
      params: {
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY
      },
      timeout: 15000
    }
  );

  const nutrients = response.data?.totalNutrients || {};

  return mapNormalizedNutrition({
    provider: 'edamam',
    foodName,
    weight,
    calories: response.data?.calories,
    protein: nutrients.PROCNT?.quantity,
    carbs: nutrients.CHOCDF?.quantity,
    fat: nutrients.FAT?.quantity,
    fiber: nutrients.FIBTG?.quantity,
    sugar: nutrients.SUGAR?.quantity,
    sodium: nutrients.NA?.quantity,
    sourceLabel: 'Live analysis from Edamam Nutrition Analysis API.',
    profileName: foodName
  });
};

const pickFatSecretServing = (servings = []) =>
  servings.find((serving) => Number(serving.is_default) === 1)
  || servings.find((serving) => Number(serving.metric_serving_amount) > 0)
  || servings[0]
  || null;

const analyzeWithFatSecret = async ({ foodName, weight }) => {
  const accessToken = await getFatSecretToken();
  const response = await axios.get('https://platform.fatsecret.com/rest/foods/search/v3', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    params: {
      search_expression: foodName,
      max_results: 6,
      page_number: 0,
      format: 'json'
    },
    timeout: 15000
  });

  const foodsSearch = response.data?.foods_search || {};
  const foods = asArray(foodsSearch.results?.food || foodsSearch.food || []);
  const selectedFood = foods[0];

  if (!selectedFood) {
    throw new Error('FatSecret did not return a matching food.');
  }

  const servings = asArray(selectedFood.servings?.serving || []);
  const selectedServing = pickFatSecretServing(servings);

  if (!selectedServing) {
    throw new Error('FatSecret returned a food without usable serving data.');
  }

  const metricWeight = Number(selectedServing.metric_serving_amount) || 100;
  const factor = weight > 0 && metricWeight > 0 ? weight / metricWeight : 1;

  return mapNormalizedNutrition({
    provider: 'fatsecret',
    foodName,
    weight,
    calories: Number(selectedServing.calories) * factor,
    protein: Number(selectedServing.protein) * factor,
    carbs: Number(selectedServing.carbohydrate) * factor,
    fat: Number(selectedServing.fat) * factor,
    fiber: Number(selectedServing.fiber) * factor,
    sugar: Number(selectedServing.sugar) * factor,
    sodium: Number(selectedServing.sodium) * factor,
    sourceLabel: 'Live lookup from FatSecret Platform API.',
    profileName: selectedFood.food_name || foodName
  });
};

const getRecipeCalories = (recipe = {}) => {
  const nutrients = asArray(recipe.nutrition?.nutrients || []);
  return nutrients.find((entry) => entry.name === 'Calories')?.amount || 0;
};

const getRecipeMacro = (recipe = {}, macroName = '') => {
  const nutrients = asArray(recipe.nutrition?.nutrients || []);
  return nutrients.find((entry) => entry.name === macroName)?.amount || 0;
};

const searchSpoonacularRecipes = async ({ query, diet = '', maxCalories = '' }) => {
  const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
    params: {
      apiKey: process.env.SPOONACULAR_API_KEY,
      query,
      number: 6,
      addRecipeInformation: true,
      addRecipeNutrition: true,
      diet: diet || undefined,
      maxCalories: maxCalories || undefined
    },
    timeout: 15000
  });

  return asArray(response.data?.results || []).map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    sourceUrl: recipe.sourceUrl,
    servings: recipe.servings,
    readyInMinutes: recipe.readyInMinutes,
    calories: round(getRecipeCalories(recipe), 0),
    protein: round(getRecipeMacro(recipe, 'Protein')),
    carbs: round(getRecipeMacro(recipe, 'Carbohydrates')),
    fat: round(getRecipeMacro(recipe, 'Fat'))
  }));
};

export const getIntegrationStatus = () => ({
  nutrition: {
    defaultProvider: getConfiguredNutritionProvider(),
    providers: Object.values(nutritionProviders)
  },
  wellness: {
    providers: Object.values(wellnessProviders)
  }
});

export const analyzeNutrition = async ({ foodName, weight, provider = 'auto' }) => {
  const normalizedFoodName = String(foodName || '').trim();
  const normalizedWeight = Math.max(1, Number(weight) || 0);

  if (!normalizedFoodName || !normalizedWeight) {
    throw new Error('Food name and weight are required for live nutrition analysis.');
  }

  const activeProvider = getConfiguredNutritionProvider(provider);

  if (!activeProvider) {
    throw new Error('No live nutrition provider is configured on the server.');
  }

  if (activeProvider === 'edamam') {
    return analyzeWithEdamam({ foodName: normalizedFoodName, weight: normalizedWeight });
  }

  if (activeProvider === 'fatsecret') {
    return analyzeWithFatSecret({ foodName: normalizedFoodName, weight: normalizedWeight });
  }

  throw new Error(`Provider "${activeProvider}" does not support direct nutrition analysis.`);
};

export const searchNutritionRecipes = async ({ query, diet = '', maxCalories = '' }) => {
  if (!nutritionProviders.spoonacular.configured) {
    throw new Error('Spoonacular is not configured on the server.');
  }

  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery) {
    throw new Error('A recipe search query is required.');
  }

  return searchSpoonacularRecipes({
    query: normalizedQuery,
    diet,
    maxCalories
  });
};
