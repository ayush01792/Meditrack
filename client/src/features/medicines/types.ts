import { z } from 'zod';

export const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required').max(100),
  dosage: z.string().min(1, 'Dosage is required'),
  form: z.enum(['tablet', 'capsule', 'syrup', 'injection', 'drops', 'other']),
  frequency: z.enum(['once_daily', 'twice_daily', 'thrice_daily', 'as_needed']),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format')).min(1, 'Add at least one time'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  notes: z.string().max(300).optional(),
});

export type MedicineFormValues = z.infer<typeof medicineSchema>;
