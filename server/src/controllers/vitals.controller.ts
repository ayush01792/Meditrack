import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { VitalQueries } from '../db/queries/vitals.queries';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest, VitalRow } from '../types';

export const vitalSchema = z
  .object({
    type: z.enum(['blood_pressure', 'blood_sugar', 'weight']),
    value: z.number().positive().optional(),
    systolic: z.number().positive().optional(),
    diastolic: z.number().positive().optional(),
    notes: z.string().max(200).optional(),
  })
  .refine(
    (d) => d.type === 'blood_pressure' ? !!(d.systolic && d.diastolic) : !!d.value,
    { message: 'Missing required vital values for the selected type' }
  );

const UNIT_MAP: Record<string, string> = {
  blood_pressure: 'mmHg',
  blood_sugar: 'mg/dL',
  weight: 'kg',
};

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

export async function listVitals(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const type = req.query.type as string | undefined;
    const limit = parseInt(req.query.limit as string) || 30;

    const vitals = await VitalQueries.findForUser(userId, type, limit);
    res.json({
      success: true,
      message: 'Vitals fetched',
      data: vitals.map(formatVital),
    });
  } catch (err) { next(err); }
}

export async function logVital(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = req.body as z.infer<typeof vitalSchema>;
    const userId = req.user!.userId;

    const vital = await VitalQueries.create(
      userId,
      body.type,
      body.value ?? null,
      body.systolic ?? null,
      body.diastolic ?? null,
      UNIT_MAP[body.type],
      body.notes ?? null
    );
    if (!vital) throw new AppError(500, 'Failed to log vital');

    res.status(201).json({
      success: true,
      message: 'Vital logged',
      data: formatVital(vital),
    });
  } catch (err) { next(err); }
}

export async function deleteVital(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    await VitalQueries.delete(id, userId);
    res.json({ success: true, message: 'Vital deleted' });
  } catch (err) { next(err); }
}
