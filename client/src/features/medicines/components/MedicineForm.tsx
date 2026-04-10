import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { medicineSchema, type MedicineFormValues } from '../types';
import type { Medicine } from '@/types';
import { useCreateMedicine, useUpdateMedicine } from '../hooks/useMedicines';

interface Props {
  medicine?: Medicine;
  onSuccess: () => void;
}

const FORM_OPTIONS = {
  frequency: [
    { value: 'once_daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'thrice_daily', label: 'Thrice daily' },
    { value: 'as_needed', label: 'As needed' },
  ],
  form: [
    { value: 'tablet', label: 'Tablet' },
    { value: 'capsule', label: 'Capsule' },
    { value: 'syrup', label: 'Syrup' },
    { value: 'injection', label: 'Injection' },
    { value: 'drops', label: 'Drops' },
    { value: 'other', label: 'Other' },
  ],
};

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export default function MedicineForm({ medicine, onSuccess }: Props) {
  const isEdit = !!medicine;
  const { mutate: create, isPending: creating } = useCreateMedicine();
  const { mutate: update, isPending: updating } = useUpdateMedicine();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: '',
      dosage: '',
      form: 'tablet',
      frequency: 'once_daily',
      times: ['08:00'],
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'times' as never });

  useEffect(() => {
    if (medicine) {
      reset({
        name: medicine.name,
        dosage: medicine.dosage,
        form: medicine.form,
        frequency: medicine.frequency,
        times: medicine.times,
        startDate: medicine.startDate,
        endDate: medicine.endDate,
        notes: medicine.notes,
      });
    }
  }, [medicine, reset]);

  function onSubmit(values: MedicineFormValues) {
    if (isEdit) {
      update({ id: medicine!.id, payload: values }, { onSuccess });
    } else {
      create(values, { onSuccess });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="name"
          label="Medicine Name"
          placeholder="e.g. Metformin"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="dosage"
          label="Dosage"
          placeholder="e.g. 500mg"
          error={errors.dosage?.message}
          {...register('dosage')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Form</label>
          <select className={selectClass} {...register('form')}>
            {FORM_OPTIONS.form.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Frequency</label>
          <select className={selectClass} {...register('frequency')}>
            {FORM_OPTIONS.frequency.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Times */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Reminder Times</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append('08:00' as never)}
            className="h-7 text-xs"
          >
            <Plus size={12} /> Add time
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-1">
              <input
                type="time"
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register(`times.${idx}`)}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.times && (
          <p className="text-xs text-destructive">{errors.times.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="startDate"
          type="date"
          label="Start Date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />
        <Input
          id="endDate"
          type="date"
          label="End Date (optional)"
          error={errors.endDate?.message}
          {...register('endDate')}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Notes (optional)</label>
        <textarea
          rows={2}
          placeholder="e.g. Take after meals"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          {...register('notes')}
        />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
      </div>

      <Button type="submit" loading={creating || updating} className="w-full">
        {isEdit ? 'Update Medicine' : 'Add Medicine'}
      </Button>
    </form>
  );
}
