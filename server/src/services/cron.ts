import cron from 'node-cron';
import { query } from '../config/db';
import { ReminderQueries } from '../db/queries/reminders.queries';
import { AuthQueries } from '../db/queries/auth.queries';
import { sendPushNotification } from './fcm';
import { sendMail, reminderEmailHtml, weeklySummaryEmailHtml } from './mailer';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildScheduledAt(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ─── Job 1: Generate today's reminders at midnight ────────────────────────────
// Runs at 00:05 every day
async function generateDailyReminders() {
  console.log('⏰ [cron] Generating daily reminders...');
  try {
    // Get all active medicines for all users
    const medicines = await query<{
      id: string;
      user_id: string;
      times: string[];
      name: string;
    }>(
      `SELECT id, user_id, times, name FROM medicines
       WHERE is_active = TRUE
         AND start_date <= CURRENT_DATE
         AND (end_date IS NULL OR end_date >= CURRENT_DATE)`,
      []
    );

    const today = todayStr();
    const entries: { userId: string; medicineId: string; scheduledAt: Date }[] = [];

    for (const med of medicines) {
      for (const time of med.times) {
        const scheduledAt = buildScheduledAt(today, time);
        const exists = await ReminderQueries.exists(med.id, scheduledAt);
        if (!exists) {
          entries.push({ userId: med.user_id, medicineId: med.id, scheduledAt });
        }
      }
    }

    if (entries.length > 0) {
      await ReminderQueries.bulkCreate(entries);
      console.log(`✅ [cron] Created ${entries.length} reminders for ${today}`);
    }
  } catch (err) {
    console.error('❌ [cron] generateDailyReminders failed:', err);
  }
}

// ─── Job 2: Send push/email notifications every minute ────────────────────────
// Checks pending reminders due in the next 1 minute and notifies users
async function sendPendingNotifications() {
  try {
    const dueReminders = await query<{
      id: string;
      user_id: string;
      medicine_id: string;
      scheduled_at: string;
      medicine_name: string;
      dosage: string;
      fcm_token: string | null;
      email: string;
      name: string;
    }>(
      `SELECT r.id, r.user_id, r.medicine_id, r.scheduled_at,
              m.name AS medicine_name, m.dosage,
              u.fcm_token, u.email, u.name
       FROM reminders r
       JOIN medicines m ON m.id = r.medicine_id
       JOIN users u ON u.id = r.user_id
       WHERE r.status = 'pending'
         AND r.scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '1 minute'`,
      []
    );

    for (const reminder of dueReminders) {
      const scheduledAt = new Date(reminder.scheduled_at);
      const notified = { push: false, email: false };

      // FCM push notification
      if (reminder.fcm_token) {
        notified.push = await sendPushNotification({
          fcmToken: reminder.fcm_token,
          title: '💊 Medicine Reminder',
          body: `Time to take ${reminder.medicine_name} (${reminder.dosage})`,
          data: { reminderId: reminder.id, medicineId: reminder.medicine_id },
        });
      }

      // Email fallback if FCM not available or failed
      if (!notified.push) {
        await sendMail({
          to: reminder.email,
          subject: `Reminder: Take ${reminder.medicine_name}`,
          html: reminderEmailHtml(reminder.medicine_name, reminder.dosage, scheduledAt),
        }).catch((e) => console.error('Email send failed:', e));
      }
    }
  } catch (err) {
    console.error('❌ [cron] sendPendingNotifications failed:', err);
  }
}

// ─── Job 3: Mark past pending reminders as missed (every 30 min) ─────────────
async function markMissedReminders() {
  try {
    await ReminderQueries.markPastAsMissed();
    console.log('✅ [cron] Marked past pending reminders as missed');
  } catch (err) {
    console.error('❌ [cron] markMissedReminders failed:', err);
  }
}

// ─── Job 4: Weekly summary email (every Monday 08:00) ────────────────────────
async function sendWeeklySummaryEmails() {
  console.log('📧 [cron] Sending weekly summary emails...');
  try {
    const users = await query<{ id: string; name: string; email: string }>(
      'SELECT id, name, email FROM users',
      []
    );

    for (const user of users) {
      const stats = await ReminderQueries.getAdherenceStats(user.id, 7);
      const map: Record<string, number> = {};
      for (const s of stats) map[s.status] = parseInt(s.count, 10);

      const taken = map['taken'] ?? 0;
      const missed = map['missed'] ?? 0;
      const snoozed = map['snoozed'] ?? 0;
      const total = taken + missed + snoozed;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

      await sendMail({
        to: user.email,
        subject: '📊 Your Weekly Health Summary — MediTrack',
        html: weeklySummaryEmailHtml(user.name, rate, taken, missed),
      }).catch((e) => console.error(`Weekly email failed for ${user.email}:`, e));
    }

    console.log(`✅ [cron] Weekly summaries sent to ${users.length} users`);
  } catch (err) {
    console.error('❌ [cron] sendWeeklySummaryEmails failed:', err);
  }
}

// ─── Job 5: Purge expired tokens (daily at 03:00) ────────────────────────────
async function purgeExpiredTokens() {
  try {
    await AuthQueries.purgeExpiredTokens();
    console.log('✅ [cron] Purged expired refresh tokens');
  } catch (err) {
    console.error('❌ [cron] purgeExpiredTokens failed:', err);
  }
}

// ─── Register all cron jobs ───────────────────────────────────────────────────
export function startCronJobs() {
  // Generate daily reminders at 00:05
  cron.schedule('5 0 * * *', generateDailyReminders);

  // Send notifications every minute
  cron.schedule('* * * * *', sendPendingNotifications);

  // Mark missed reminders every 30 minutes
  cron.schedule('*/30 * * * *', markMissedReminders);

  // Weekly summary every Monday at 08:00
  cron.schedule('0 8 * * 1', sendWeeklySummaryEmails);

  // Purge expired tokens daily at 03:00
  cron.schedule('0 3 * * *', purgeExpiredTokens);

  // Generate reminders for today immediately on startup
  generateDailyReminders();

  console.log('✅ Cron jobs registered');
}
