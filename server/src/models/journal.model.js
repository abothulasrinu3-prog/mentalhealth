import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  moodTag: {
    type: String,
    enum: ['very-happy', 'happy', 'calm', 'neutral', 'sad', 'anxious', 'angry', 'exhausted', 'grateful', 'excited']
  },
  sentimentScore: {
    type: Number, // -1 to 1 (negative to positive)
    min: -1,
    max: 1
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, moodTag: 1 });

export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
