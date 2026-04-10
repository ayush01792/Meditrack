import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabase, PRESCRIPTIONS_BUCKET } from '../config/supabase';
import { MedicalRecordQueries } from '../db/queries/medicalRecords.queries';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../types';
import type { MedicalRecordRow } from '../db/queries/medicalRecords.queries';

export const medicalRecordSchema = z.object({
  doctorName: z.string().min(1).max(100),
  hospitalName: z.string().min(1).max(150),
  visitDate: z.string().min(1),
  diagnosis: z.string().max(300).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

function format(r: MedicalRecordRow) {
  return {
    id: r.id,
    doctorName: r.doctor_name,
    hospitalName: r.hospital_name,
    visitDate: r.visit_date,
    diagnosis: r.diagnosis ?? null,
    notes: r.notes ?? null,
    prescriptionUrl: r.prescription_url ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listRecords(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const records = await MedicalRecordQueries.findAll(req.user!.userId);
    res.json({ success: true, message: 'Records fetched', data: records.map(format) });
  } catch (err) { next(err); }
}

export async function createRecord(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = req.body as z.infer<typeof medicalRecordSchema>;
    const userId = req.user!.userId;
    let prescriptionUrl: string | null = null;

    // Handle image upload if file was attached
    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${ext}`;

      const { error } = await supabase.storage
        .from(PRESCRIPTIONS_BUCKET)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) throw new AppError(500, `Image upload failed: ${error.message}`);

      const { data: urlData } = supabase.storage
        .from(PRESCRIPTIONS_BUCKET)
        .getPublicUrl(fileName);

      prescriptionUrl = urlData.publicUrl;
    }

    const record = await MedicalRecordQueries.create(
      userId,
      body.doctorName,
      body.hospitalName,
      body.visitDate,
      body.diagnosis ?? null,
      body.notes ?? null,
      prescriptionUrl
    );
    if (!record) throw new AppError(500, 'Failed to create record');

    res.status(201).json({
      success: true,
      message: 'Medical record added',
      data: format(record!),
    });
  } catch (err) { next(err); }
}

export async function updateRecord(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const body = req.body as Partial<z.infer<typeof medicalRecordSchema>>;

    const existing = await MedicalRecordQueries.findById(id, userId);
    if (!existing) throw new AppError(404, 'Record not found');

    let prescriptionUrl: string | null | undefined = undefined;

    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${ext}`;

      const { error } = await supabase.storage
        .from(PRESCRIPTIONS_BUCKET)
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (error) throw new AppError(500, `Image upload failed: ${error.message}`);

      const { data: urlData } = supabase.storage
        .from(PRESCRIPTIONS_BUCKET)
        .getPublicUrl(fileName);

      prescriptionUrl = urlData.publicUrl;

      // Delete old image if exists
      if (existing.prescription_url) {
        const oldPath = existing.prescription_url.split(`${PRESCRIPTIONS_BUCKET}/`)[1];
        if (oldPath) await supabase.storage.from(PRESCRIPTIONS_BUCKET).remove([oldPath]);
      }
    }

    const updated = await MedicalRecordQueries.update(id, userId, {
      doctorName: body.doctorName,
      hospitalName: body.hospitalName,
      visitDate: body.visitDate,
      diagnosis: body.diagnosis,
      notes: body.notes,
      ...(prescriptionUrl !== undefined && { prescriptionUrl }),
    });

    res.json({
      success: true,
      message: 'Record updated',
      data: format(updated!),
    });
  } catch (err) { next(err); }
}

export async function deleteRecord(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const existing = await MedicalRecordQueries.findById(id, userId);
    if (!existing) throw new AppError(404, 'Record not found');

    // Delete image from storage if exists
    if (existing.prescription_url) {
      const oldPath = existing.prescription_url.split(`${PRESCRIPTIONS_BUCKET}/`)[1];
      if (oldPath) await supabase.storage.from(PRESCRIPTIONS_BUCKET).remove([oldPath]);
    }

    await MedicalRecordQueries.delete(id, userId);
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) { next(err); }
}
