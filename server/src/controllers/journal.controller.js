import { JournalEntry } from '../models/journal.model.js';

// @desc    Add journal entry
// @route   POST /api/journal/add
// @access  Private
export const addJournal = async (req, res, next) => {
  try {
    const { title, content, moodTag, tags } = req.body;
    
    // Simple sentiment analysis (placeholder - can be enhanced with ML service)
    const sentimentScore = calculateSentiment(content);
    
    const journal = await JournalEntry.create({
      userId: req.user._id,
      title,
      content,
      moodTag,
      tags,
      sentimentScore
    });

    res.status(201).json({
      success: true,
      message: 'Journal entry added successfully',
      data: journal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get journal entries
// @route   GET /api/journal/list
// @access  Private
export const getJournals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, moodTag, startDate, endDate } = req.query;
    
    const query = { userId: req.user._id };
    
    if (moodTag) query.moodTag = moodTag;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const journals = await JournalEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await JournalEntry.countDocuments(query);

    res.json({
      success: true,
      data: journals,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        total: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search journal entries
// @route   GET /api/journal/search
// @access  Private
export const searchJournals = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    const journals = await JournalEntry.find({
      userId: req.user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: journals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single journal
// @route   GET /api/journal/:id
// @access  Private
export const getJournalById = async (req, res, next) => {
  try {
    const journal = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      data: journal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update journal
// @route   PUT /api/journal/:id
// @access  Private
export const updateJournal = async (req, res, next) => {
  try {
    const { title, content, moodTag, tags, isFavorite } = req.body;
    
    const sentimentScore = calculateSentiment(content);
    
    const journal = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, content, moodTag, tags, isFavorite, sentimentScore },
      { new: true }
    );

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journal entry updated',
      data: journal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete journal
// @route   DELETE /api/journal/:id
// @access  Private
export const deleteJournal = async (req, res, next) => {
  try {
    const journal = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journal entry deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Simple sentiment calculation (placeholder)
const calculateSentiment = (text) => {
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'joy', 'love', 'wonderful', 'amazing', 'grateful', 'positive'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'anxious', 'worried', 'negative'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 0.1;
    if (negativeWords.includes(word)) score -= 0.1;
  });
  
  return Math.max(-1, Math.min(1, score));
};
