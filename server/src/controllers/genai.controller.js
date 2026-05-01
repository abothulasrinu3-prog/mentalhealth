import {
  appendConversationTurns,
  generateCarePlan,
  generateRagResponse,
  generateThoughtReframe,
  generateVisualConcept,
  getConversationTurns,
  getGenAIStackSummary,
  getUserWellnessContext,
  retrieveKnowledge
} from '../utils/genai-engine.js';

// @desc    Get GenAI stack summary
// @route   GET /api/genai/stack
// @access  Private
export const getGenAIStack = async (req, res, next) => {
  try {
    const sessionId = String(req.query.sessionId || 'default');
    const context = await getUserWellnessContext(req.user._id);
    const history = getConversationTurns({ userId: req.user._id, sessionId });

    res.json({
      success: true,
      data: {
        ...getGenAIStackSummary(),
        userContextPreview: {
          dominantMoods: context.dominantMoods,
          topThemes: context.topThemes,
          topSignals: context.topSignals
        },
        conversationPreview: {
          sessionId,
          turnsTracked: history.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate RAG-backed chatbot response
// @route   POST /api/genai/chat
// @access  Private
export const generateGenAIChat = async (req, res, next) => {
  try {
    const { message = '', mode = 'support', sessionId = 'default' } = req.body;
    const normalizedMode = String(mode || 'support').toLowerCase().trim() || 'support';
    const normalizedSessionId = String(sessionId || 'default').slice(0, 60);

    if (!message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A message is required.'
      });
    }

    const userContext = await getUserWellnessContext(req.user._id);
    const conversationHistory = getConversationTurns({
      userId: req.user._id,
      sessionId: normalizedSessionId
    });

    const documents = retrieveKnowledge({
      message,
      mode: normalizedMode,
      userContext,
      conversationHistory
    });

    const result = generateRagResponse({
      message,
      mode: normalizedMode,
      userContext,
      documents,
      conversationHistory
    });

    const updatedHistory = appendConversationTurns({
      userId: req.user._id,
      sessionId: normalizedSessionId,
      turns: [
        { role: 'user', content: message },
        { role: 'assistant', content: result.reply }
      ]
    });

    res.json({
      success: true,
      data: {
        ...result,
        mode: normalizedMode,
        sessionId: normalizedSessionId,
        conversation: {
          turnsTracked: updatedHistory.length
        },
        model: {
          provider: 'mindcare-hybrid-rag',
          type: 'retrieval-augmented generation',
          retrievalBand: result.retrieval?.band || 'emerging'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a short wellness care plan
// @route   POST /api/genai/care-plan
// @access  Private
export const generateGenAICarePlan = async (req, res, next) => {
  try {
    const { goal = '', days = 5 } = req.body;
    const userContext = await getUserWellnessContext(req.user._id);
    const plan = generateCarePlan({ goal, days, userContext });

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a GAN-ready wellness visual concept pack
// @route   POST /api/genai/visual-concept
// @access  Private
export const generateGenAIVisualConcept = async (req, res, next) => {
  try {
    const { mood = '', goal = '', aesthetic = 'calm' } = req.body;
    const userContext = await getUserWellnessContext(req.user._id);
    const concept = generateVisualConcept({ mood, goal, aesthetic, userContext });

    res.json({
      success: true,
      data: concept
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a CBT-style thought reframe
// @route   POST /api/genai/reframe
// @access  Private
export const generateGenAIReframe = async (req, res, next) => {
  try {
    const { thought = '' } = req.body;
    if (!String(thought || '').trim()) {
      return res.status(400).json({
        success: false,
        message: 'A thought is required for reframing.'
      });
    }

    const userContext = await getUserWellnessContext(req.user._id);
    const reframe = generateThoughtReframe({ thought, userContext });

    res.json({
      success: true,
      data: reframe
    });
  } catch (error) {
    next(error);
  }
};
