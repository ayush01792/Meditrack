import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { vitalSchema, type VitalFormValues } from '../types';
import { useLogVital } from '../hooks/useVitals';

interface Props {
  onSuccess?: () => void;
}

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function VitalForm({ onSuccess }: Props) {
  const { mutate: log, isPending } = useLogVital();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vitalSchema),
    defaultValues: { type: 'blood_sugar' as const },
  });

  const type = useWatch({ control, name: 'type' });

  function onSubmit(values: VitalFormValues) {
    // Custom cross-field validation (zod refine removed for resolver compat)
    if (values.type === 'blood_pressure' && (!values.systolic || !values.diastolic)) {
      toast.error('Enter both systolic and diastolic values.');
      return;
    }
    if (values.type !== 'blood_pressure' && !values.value) {
      toast.error('Please enter a value.');
      return;
    }
    log(values, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Vital Type</label>
        <select className={selectClass} {...register('type')}>
          <option value="blood_sugar">Blood Sugar</option>
          <option value="blood_pressure">Blood Pressure</option>
          <option value="weight">Weight</option>
        </select>
      </div>

      {type === 'blood_pressure' ? (
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="systolic"
            type="number"
            label="Systolic (mmHg)"
            placeholder="e.g. 120"
            error={errors.systolic?.message}
            {...register('systolic')}
          />
          <Input
            id="diastolic"
            type="number"
            label="Diastolic (mmHg)"
            placeholder="e.g. 80"
            error={errors.diastolic?.message}
            {...register('diastolic')}
          />
        </div>
      ) : (
        <Input
          id="value"
          type="number"
          step="0.1"
          label={type === 'blood_sugar' ? 'Blood Sugar (mg/dL)' : 'Weight (kg)'}
          placeholder={type === 'blood_sugar' ? 'e.g. 110' : 'e.g. 70.5'}
          error={errors.value?.message}
          {...register('value')}
        />
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Notes (optional)</label>
        <textarea
          rows={2}
          placeholder="e.g. Fasting measurement"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          {...register('notes')}
        />
      </div>

      <Button type="submit" loading={isPending} className="w-full">
        Log Vital
      </Button>
    </form>
  );
}
