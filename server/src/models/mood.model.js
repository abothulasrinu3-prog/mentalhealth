import mongoose from 'mongoose';

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  moodLabel: {
    type: String,
    required: true,
    enum: ['very-happy', 'happy', 'calm', 'neutral', 'sad', 'anxious', 'angry', 'exhausted']
  },
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  note: {
    type: String,
    maxlength: 500
  },
  // Wellness metrics
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  waterIntake: {
    type: Number, // in glasses
    min: 0,
    max: 20
  },
  exerciseMinutes: {
    type: Number,
    min: 0,
    max: 300
  },
  meditationMinutes: {
    type: Number,
    min: 0,
    max: 180
  },
  screenTime: {
    type: Number, // in hours
    min: 0,
    max: 24
  },
  workHours: {
    type: Number,
    min: 0,
    max: 24
  },
  socialInteraction: {
    type: Number, // rating 1-10
    min: 1,
    max: 10
  },
  appetiteLevel: {
    type: Number, // rating 1-10
    min: 1,
    max: 10
  },
  energyLevel: {
    type: Number, // rating 1-10
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Index for efficient queries
moodEntrySchema.index({ userId: 1, createdAt: -1 });

export const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);
