import cron from 'node-cron';
import { connectDB } from '../config/db.js';
import { TimetableItem } from '../models/timetable.model.js';
import { User } from '../models/user.model.js';
import { sendReminderEmail } from './email.service.js';

let task;
let isRunning = false;

const getPartsForTimezone = (date, timeZone) => {
  const safeTimeZone = timeZone || 'Asia/Kolkata';
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTimeZone,
    hour12: false,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short'
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );

  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    time: `${parts.hour}:${parts.minute}`,
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: weekdayMap[parts.weekday]
  };
};

const getSafePartsForTimezone = (date, timeZone) => {
  try {
    return getPartsForTimezone(date, timeZone);
  } catch (error) {
    console.warn(`Invalid timetable timezone "${timeZone}", falling back to Asia/Kolkata`);
    return getPartsForTimezone(date, 'Asia/Kolkata');
  }
};

const appendLog = (item, log) => {
  item.logs = [log, ...item.logs].slice(0, 60);
};

const parseTimeToMinutes = (time = '') => {
  const [hour, minute] = time.split(':').map(Number);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  return hour * 60 + minute;
};

const getReminderLookbackMinutes = () => {
  const value = Number(process.env.REMINDER_LOOKBACK_MINUTES || 2);

  if (!Number.isFinite(value) || value < 0) {
    return 2;
  }

  return Math.min(Math.floor(value), 60);
};

const isDueNow = ({ currentTime, scheduledTime, lookbackMinutes }) => {
  const currentMinutes = parseTimeToMinutes(currentTime);
  const scheduledMinutes = parseTimeToMinutes(scheduledTime);

  if (currentMinutes === null || scheduledMinutes === null) {
    return false;
  }

  const elapsedMinutes = currentMinutes - scheduledMinutes;
  return elapsedMinutes >= 0 && elapsedMinutes <= lookbackMinutes;
};

export const runReminderCheck = async () => {
  if (isRunning) {
    return;
  }

  isRunning = true;

  try {
    await connectDB();
    const now = new Date();
    const activeItems = await TimetableItem.find({
      active: true,
      reminderEnabled: true
    }).lean(false);
    const lookbackMinutes = getReminderLookbackMinutes();

    for (const item of activeItems) {
      const parts = getSafePartsForTimezone(now, item.timezone || 'Asia/Kolkata');
      const sentKey = `${parts.dateKey}:${item.time}`;

      if (
        !isDueNow({
          currentTime: parts.time,
          scheduledTime: item.time,
          lookbackMinutes
        }) ||
        item.lastReminderSentKey === sentKey ||
        !item.daysOfWeek.includes(parts.weekday)
      ) {
        continue;
      }

      try {
        const user = await User.findById(item.userId).select('name email');
        const to = item.userEmail || user?.email;

        if (!to) {
          throw new Error('No user email found for timetable reminder');
        }

        await sendReminderEmail({
          to,
          name: user?.name,
          item
        });

        item.lastReminderSentKey = sentKey;
        appendLog(item, {
          status: 'sent',
          sentKey,
          note: 'Reminder email processed'
        });
        await item.save();
      } catch (error) {
        appendLog(item, {
          status: 'failed',
          sentKey,
          note: error.message || 'Reminder email failed'
        });
        await item.save();
        console.error('Reminder email failed:', error.message);
      }
    }
  } catch (error) {
    console.error('Reminder scheduler failed:', error.message);
  } finally {
    isRunning = false;
  }
};

export const startReminderScheduler = () => {
  if (task) {
    return task;
  }

  task = cron.schedule('* * * * *', runReminderCheck);
  console.log('MindCare reminder scheduler started');
  return task;
};
