import { query, queryOne } from '../../config/db';
import type { ReminderRow } from '../../types';

export const ReminderQueries = {
  findForUser: (userId: string, status?: string) => {
    const base = `
      SELECT r.*, m.name AS medicine_name, m.dosage
      FROM reminders r
      JOIN medicines m ON m.id = r.medicine_id
      WHERE r.user_id = $1
    `;
    if (status) {
      return query<ReminderRow>(`${base} AND r.status = $2 ORDER BY r.scheduled_at DESC`, [userId, status]);
    }
    return query<ReminderRow>(`${base} ORDER BY r.scheduled_at DESC LIMIT 100`, [userId]);
  },

  findTodayForUser: (userId: string) =>
    query<ReminderRow>(
      `SELECT r.*, m.name AS medicine_name, m.dosage
       FROM reminders r
       JOIN medicines m ON m.id = r.medicine_id
       WHERE r.user_id = $1
         AND r.scheduled_at::date = CURRENT_DATE
       ORDER BY r.scheduled_at ASC`,
      [userId]
    ),

  findById: (id: string, userId: string) =>
    queryOne<ReminderRow>(
      'SELECT * FROM reminders WHERE id = $1 AND user_id = $2',
      [id, userId]
    ),

  create: (userId: string, medicineId: string, scheduledAt: Date) =>
    queryOne<ReminderRow>(
      `INSERT INTO reminders (user_id, medicine_id, scheduled_at)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, medicineId, scheduledAt]
    ),

  bulkCreate: (entries: { userId: string; medicineId: string; scheduledAt: Date }[]) => {
    if (entries.length === 0) return Promise.resolve([]);
    const values = entries.flatMap((e) => [e.userId, e.medicineId, e.scheduledAt]);
    const placeholders = entries
      .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
      .join(',');
    return query<ReminderRow>(
      `INSERT INTO reminders (user_id, medicine_id, scheduled_at) VALUES ${placeholders}
       ON CONFLICT DO NOTHING RETURNING *`,
      values
    );
  },

  updateStatus: (
    id: string,
    userId: string,
    status: string,
    snoozedUntil?: string | null,
    takenAt?: string | null
  ) =>
    queryOne<ReminderRow>(
      `UPDATE reminders
       SET status = $1,
           snoozed_until = $2,
           taken_at = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [status, snoozedUntil ?? null, takenAt ?? null, id, userId]
    ),

  getAdherenceStats: (userId: string, days: number) =>
    query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) AS count
       FROM reminders
       WHERE user_id = $1
         AND scheduled_at >= NOW() - INTERVAL '${days} days'
       GROUP BY status`,
      [userId]
    ),

  // Check if reminder already exists (avoid duplicates from cron)
  exists: (medicineId: string, scheduledAt: Date) =>
    queryOne<{ id: string }>(
      `SELECT id FROM reminders WHERE medicine_id = $1 AND scheduled_at = $2`,
      [medicineId, scheduledAt]
    ),

  // Mark all pending past reminders as missed
  markPastAsMissed: () =>
    query(
      `UPDATE reminders
       SET status = 'missed'
       WHERE status = 'pending'
         AND scheduled_at < NOW() - INTERVAL '1 hour'`,
      []
    ),
};
