import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import moodRoutes from './routes/mood.routes.js';
import journalRoutes from './routes/journal.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import suggestionRoutes from './routes/suggestion.routes.js';
import adminRoutes from './routes/admin.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import genaiRoutes from './routes/genai.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import { startReminderScheduler } from './utils/reminder-scheduler.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const parseEnvList = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const escapeRegExp = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const devPorts = [5173, 5174, 5175, 5176, 5177];
const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  ...parseEnvList(process.env.ALLOWED_ORIGINS),
  ...devPorts.flatMap((port) => [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ]),
].filter(Boolean));

const allowVercelPreview =
  String(process.env.ALLOW_VERCEL_PREVIEW || '').toLowerCase() === 'true';
const vercelProjectName = String(process.env.VERCEL_PROJECT_NAME || '')
  .trim()
  .toLowerCase();

const vercelOriginPattern = vercelProjectName
  ? new RegExp(
      `^https://${escapeRegExp(
        vercelProjectName
      )}(?:-[a-z0-9-]+)?\\.vercel\\.app$`,
      'i'
    )
  : /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.has(origin)) {
    return true;
  }

  if (allowVercelPreview && vercelOriginPattern.test(origin)) {
    return true;
  }

  // Allow browser preview proxy origins in development
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
    return true;
  }

  return false;
};

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/genai', genaiRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/timetable', timetableRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startReminderScheduler();
  });
}

export default app;
