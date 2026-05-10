import mongoose from 'mongoose';

const timetableLogSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['sent', 'completed', 'skipped', 'failed'],
      required: true
    },
    note: {
      type: String,
      maxlength: 300,
      default: ''
    },
    sentKey: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const timetableItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
      maxlength: [80, 'Activity title cannot exceed 80 characters']
    },
    category: {
      type: String,
      enum: [
        'study',
        'meditation',
        'workout',
        'sleep',
        'medication',
        'water',
        'mood',
        'therapy',
        'affirmation',
        'breathing',
        'journal',
        'other'
      ],
      default: 'other',
      index: true
    },
    time: {
      type: String,
      required: [true, 'Reminder time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm format']
    },
    endTime: {
      type: String,
      default: '',
      match: [/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:mm format']
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    daysOfWeek: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
      validate: {
        validator: (days) => days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6),
        message: 'Days of week must be numbers from 0 to 6'
      }
    },
    note: {
      type: String,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: ''
    },
    workingProblem: {
      type: String,
      maxlength: [500, 'Working problem cannot exceed 500 characters'],
      default: ''
    },
    reminderEnabled: {
      type: Boolean,
      default: true,
      index: true
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    lastReminderSentKey: {
      type: String,
      default: ''
    },
    logs: {
      type: [timetableLogSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

timetableItemSchema.index({ userId: 1, time: 1, active: 1 });
timetableItemSchema.index({ reminderEnabled: 1, active: 1, time: 1 });

export const TimetableItem = mongoose.model('TimetableItem', timetableItemSchema);
