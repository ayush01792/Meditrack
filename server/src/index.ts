import './config/env'; // validate env first
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { pool } from './config/db';
import { initFirebase } from './config/firebase';
import { ensureStorageBucket } from './config/supabase';
import { startCronJobs } from './services/cron';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes           from './routes/auth';
import medicinesRoutes      from './routes/medicines';
import vitalsRoutes         from './routes/vitals';
import remindersRoutes      from './routes/reminders';
import dashboardRoutes      from './routes/dashboard';
import reportsRoutes        from './routes/reports';
import medicalRecordsRoutes from './routes/medicalRecords';

const app = express();

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // stricter for auth endpoints
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(limiter);
app.use(express.json({ limit: '10kb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/vitals',    vitalsRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports',         reportsRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Startup ──────────────────────────────────────────────────────────────────
async function start() {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected');

    // Init Firebase (optional — gracefully skips if not configured)
    initFirebase();

    // Ensure Supabase Storage bucket exists
    await ensureStorageBucket();

    // Start cron jobs
    startCronJobs();

    app.listen(parseInt(env.PORT), () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
