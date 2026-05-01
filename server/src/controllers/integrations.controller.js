import {
  analyzeNutrition,
  getIntegrationStatus,
  searchNutritionRecipes
} from '../utils/integrations.js';

// @desc    Get external integration readiness
// @route   GET /api/integrations/status
// @access  Private
export const getStatus = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: getIntegrationStatus()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze food nutrition using a live provider
// @route   POST /api/integrations/nutrition/analyze
// @access  Private
export const analyzeFoodNutrition = async (req, res, next) => {
  try {
    const { foodName, weight, provider } = req.body;
    const data = await analyzeNutrition({ foodName, weight, provider });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Live nutrition analysis failed.'
    });
  }
};

// @desc    Search recipes from Spoonacular
// @route   GET /api/integrations/nutrition/recipes
// @access  Private
export const searchRecipes = async (req, res, next) => {
  try {
    const { query, diet = '', maxCalories = '' } = req.query;
    const results = await searchNutritionRecipes({ query, diet, maxCalories });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Recipe search failed.'
    });
  }
};
