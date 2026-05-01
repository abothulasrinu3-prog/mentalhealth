import mongoose from 'mongoose';

const suggestionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  suggestionText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['sleep', 'stress-reduction', 'physical-activity', 'mindfulness', 'hydration', 'journaling', 'social-connection', 'motivation', 'general']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isHelpful: {
    type: Boolean,
    default: null
  }
}, {
  timestamps: true
});

suggestionLogSchema.index({ userId: 1, createdAt: -1 });

export const SuggestionLog = mongoose.model('SuggestionLog', suggestionLogSchema);
