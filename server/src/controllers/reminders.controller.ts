import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ReminderQueries } from '../db/queries/reminders.queries';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest, ReminderRow } from '../types';

export const statusSchema = z.object({
  status: z.enum(['taken', 'missed', 'snoozed', 'pending']),
  snoozedUntil: z.string().optional(),
});

function formatReminder(r: ReminderRow) {
  return {
    id: r.id,
    medicineId: r.medicine_id,
    medicineName: r.medicine_name ?? null,
    dosage: r.dosage ?? null,
    scheduledAt: r.scheduled_at,
    status: r.status,
    snoozedUntil: r.snoozed_until ?? null,
    takenAt: r.taken_at ?? null,
  };
}

export async function listReminders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const status = req.query.status as string | undefined;

    const reminders = await ReminderQueries.findForUser(userId, status);
    res.json({
      success: true,
      message: 'Reminders fetched',
      data: reminders.map(formatReminder),
    });
  } catch (err) { next(err); }
}

export async function updateReminderStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const { status, snoozedUntil } = req.body as z.infer<typeof statusSchema>;

    const existing = await ReminderQueries.findById(id, userId);
    if (!existing) throw new AppError(404, 'Reminder not found');

    const takenAt = status === 'taken' ? new Date().toISOString() : null;
    const updated = await ReminderQueries.updateStatus(id, userId, status, snoozedUntil, takenAt);

    res.json({
      success: true,
      message: 'Reminder updated',
      data: formatReminder(updated!),
    });
  } catch (err) { next(err); }
}
