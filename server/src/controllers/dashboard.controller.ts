import type { Response, NextFunction } from 'express';
import { ReminderQueries } from '../db/queries/reminders.queries';
import { MedicineQueries } from '../db/queries/medicines.queries';
import { VitalQueries } from '../db/queries/vitals.queries';
import type { AuthRequest, ReminderRow, VitalRow } from '../types';

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

function formatVital(v: VitalRow) {
  return {
    id: v.id,
    type: v.type,
    value: v.value ? parseFloat(v.value as unknown as string) : null,
    systolic: v.systolic ?? null,
    diastolic: v.diastolic ?? null,
    unit: v.unit,
    notes: v.notes ?? null,
    loggedAt: v.logged_at,
  };
}

export async function getDashboardSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const [adherenceRaw, todayReminders, activeMedicines, recentVitals] = await Promise.all([
      ReminderQueries.getAdherenceStats(userId, 7),
      ReminderQueries.findTodayForUser(userId),
      MedicineQueries.countActive(userId),
      VitalQueries.findRecent(userId, 5),
    ]);

    const statsMap: Record<string, number> = {};
    for (const row of adherenceRaw) {
      statsMap[row.status] = parseInt(row.count, 10);
    }
    const taken = statsMap['taken'] ?? 0;
    const missed = statsMap['missed'] ?? 0;
    const snoozed = statsMap['snoozed'] ?? 0;
    const total = taken + missed + snoozed + (statsMap['pending'] ?? 0);
    const adherenceRate = (taken + missed + snoozed) > 0
      ? Math.round((taken / (taken + missed + snoozed)) * 100)
      : 0;

    res.json({
      success: true,
      message: 'Dashboard summary fetched',
      data: {
        adherence: { total, taken, missed, snoozed, adherenceRate },
        todayReminders: todayReminders.map(formatReminder),
        activeMedicines,
        recentVitals: recentVitals.map(formatVital),
      },
    });
  } catch (err) { next(err); }
}
