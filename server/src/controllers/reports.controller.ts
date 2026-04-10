import type { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { AuthQueries } from '../db/queries/auth.queries';
import { MedicineQueries } from '../db/queries/medicines.queries';
import { VitalQueries } from '../db/queries/vitals.queries';
import { ReminderQueries } from '../db/queries/reminders.queries';
import { ReportQueries } from '../db/queries/reports.queries';
import { generateHealthReportPDF } from '../services/pdf';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../types';

// ─── Generate + stream PDF ────────────────────────────────────────────────────
export async function downloadReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const [user, medicines, vitals, adherenceRaw] = await Promise.all([
      AuthQueries.findById(userId),
      MedicineQueries.findAll(userId, 1, 100),
      VitalQueries.findForUser(userId, undefined, 20),
      ReminderQueries.getAdherenceStats(userId, 30),
    ]);

    if (!user) throw new AppError(404, 'User not found');

    const statsMap: Record<string, number> = {};
    for (const row of adherenceRaw) statsMap[row.status] = parseInt(row.count, 10);

    const taken = statsMap['taken'] ?? 0;
    const missed = statsMap['missed'] ?? 0;
    const snoozed = statsMap['snoozed'] ?? 0;
    const total = taken + missed + snoozed;
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

    const fileName = `health-report-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const doc = generateHealthReportPDF({
      userName: user.name,
      adherenceRate,
      taken,
      missed,
      snoozed,
      medicines,
      vitals,
      generatedAt: new Date(),
    });

    doc.pipe(res);
  } catch (err) {
    next(err);
  }
}

// ─── Generate doctor share token ──────────────────────────────────────────────
export async function generateShareToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    // Revoke previous tokens
    await ReportQueries.deleteShareTokensForUser(userId);

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    await ReportQueries.createShareToken(userId, token, expiresAt);

    res.json({
      success: true,
      message: 'Share token generated',
      data: { token, expiresAt: expiresAt.toISOString() },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Public shared report view (no auth required) ─────────────────────────────
export async function getSharedReport(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.params.token as string;

    const shareRecord = await ReportQueries.findShareToken(token);
    if (!shareRecord) throw new AppError(404, 'Share link is invalid or has expired');

    const userId = shareRecord.user_id;
    const [user, medicines, vitals, adherenceRaw] = await Promise.all([
      AuthQueries.findById(userId),
      MedicineQueries.findActive(userId),
      VitalQueries.findForUser(userId, undefined, 10),
      ReminderQueries.getAdherenceStats(userId, 7),
    ]);

    if (!user) throw new AppError(404, 'Not found');

    const statsMap: Record<string, number> = {};
    for (const row of adherenceRaw) statsMap[row.status] = parseInt(row.count, 10);
    const taken = statsMap['taken'] ?? 0;
    const missed = statsMap['missed'] ?? 0;
    const snoozed = statsMap['snoozed'] ?? 0;
    const total = taken + missed + snoozed;

    res.json({
      success: true,
      message: 'Shared report fetched',
      data: {
        patientName: user.name,
        adherence: {
          taken,
          missed,
          snoozed,
          total,
          adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
        },
        activeMedicines: medicines.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          form: m.form,
          frequency: m.frequency,
          times: m.times,
        })),
        recentVitals: vitals.map((v) => ({
          type: v.type,
          value: v.value,
          systolic: v.systolic,
          diastolic: v.diastolic,
          unit: v.unit,
          loggedAt: v.logged_at,
        })),
        expiresAt: shareRecord.expires_at,
      },
    });
  } catch (err) {
    next(err);
  }
}
