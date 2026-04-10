import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { MedicineQueries } from '../db/queries/medicines.queries';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest, MedicineRow } from '../types';

export const medicineSchema = z.object({
  name: z.string().min(1).max(100),
  dosage: z.string().min(1),
  form: z.enum(['tablet', 'capsule', 'syrup', 'injection', 'drops', 'other']),
  frequency: z.enum(['once_daily', 'twice_daily', 'thrice_daily', 'as_needed']),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  notes: z.string().max(300).optional().nullable(),
});

export const toggleSchema = z.object({ isActive: z.boolean() });

function formatMedicine(m: MedicineRow) {
  return {
    id: m.id,
    name: m.name,
    dosage: m.dosage,
    form: m.form,
    frequency: m.frequency,
    times: m.times,
    startDate: m.start_date,
    endDate: m.end_date ?? null,
    notes: m.notes ?? null,
    isActive: m.is_active,
    createdAt: m.created_at,
  };
}

export async function listMedicines(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const userId = req.user!.userId;

    const [medicines, total] = await Promise.all([
      MedicineQueries.findAll(userId, page, limit),
      MedicineQueries.count(userId),
    ]);

    res.json({
      success: true,
      message: 'Medicines fetched',
      data: { data: medicines.map(formatMedicine), total, page, limit },
    });
  } catch (err) { next(err); }
}

export async function createMedicine(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = req.body as z.infer<typeof medicineSchema>;
    const userId = req.user!.userId;

    const medicine = await MedicineQueries.create(
      userId, body.name, body.dosage, body.form, body.frequency,
      body.times, body.startDate, body.endDate ?? null, body.notes ?? null
    );
    if (!medicine) throw new AppError(500, 'Failed to create medicine');

    res.status(201).json({
      success: true,
      message: 'Medicine created',
      data: formatMedicine(medicine),
    });
  } catch (err) { next(err); }
}

export async function updateMedicine(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const body = req.body as Partial<z.infer<typeof medicineSchema>>;

    const existing = await MedicineQueries.findById(id, userId);
    if (!existing) throw new AppError(404, 'Medicine not found');

    const updated = await MedicineQueries.update(id, userId, {
      name: body.name,
      dosage: body.dosage,
      form: body.form,
      frequency: body.frequency,
      times: body.times,
      startDate: body.startDate,
      endDate: body.endDate,
      notes: body.notes,
    });

    res.json({
      success: true,
      message: 'Medicine updated',
      data: formatMedicine(updated!),
    });
  } catch (err) { next(err); }
}

export async function toggleMedicine(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body as { isActive: boolean };
    const userId = req.user!.userId;

    const medicine = await MedicineQueries.toggleActive(id, userId, isActive);
    if (!medicine) throw new AppError(404, 'Medicine not found');

    res.json({
      success: true,
      message: `Medicine ${isActive ? 'activated' : 'deactivated'}`,
      data: formatMedicine(medicine),
    });
  } catch (err) { next(err); }
}

export async function deleteMedicine(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const existing = await MedicineQueries.findById(id, userId);
    if (!existing) throw new AppError(404, 'Medicine not found');

    await MedicineQueries.delete(id, userId);
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (err) { next(err); }
}
