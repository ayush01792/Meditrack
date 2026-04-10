import { z } from 'zod';

// Use string inputs and transform — avoids z.coerce resolver type conflicts
const optionalNum = z
  .string()
  .optional()
  .transform((v) => (v === '' || v === undefined ? undefined : parseFloat(v)))
  .pipe(z.number().positive().optional());

export const vitalSchema = z.object({
  type: z.enum(['blood_pressure', 'blood_sugar', 'weight']),
  systolic: optionalNum,
  diastolic: optionalNum,
  value: optionalNum,
  notes: z.string().max(200).optional(),
});

export type VitalFormValues = z.infer<typeof vitalSchema>;
