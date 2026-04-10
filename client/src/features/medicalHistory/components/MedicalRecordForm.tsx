import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRef, useState } from 'react';
import { Upload, X, FileImage } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateMedicalRecord } from '../hooks/useMedicalHistory';

const schema = z.object({
  doctorName: z.string().min(1, 'Doctor name is required').max(100),
  hospitalName: z.string().min(1, 'Hospital name is required').max(150),
  visitDate: z.string().min(1, 'Visit date is required'),
  diagnosis: z.string().max(300).optional(),
  notes: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onSuccess: () => void;
}

export default function MedicalRecordForm({ onSuccess }: Props) {
  const { mutate: create, isPending } = useCreateMedicalRecord();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function handleFile(f: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      alert('Only JPEG, PNG, WebP or PDF files allowed');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }
    setFile(f);
  }

  function onSubmit(values: FormValues) {
    create(
      { ...values, prescription: file ?? undefined },
      { onSuccess }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="doctorName"
          label="Doctor Name"
          placeholder="Dr. Sharma"
          error={errors.doctorName?.message}
          {...register('doctorName')}
        />
        <Input
          id="hospitalName"
          label="Hospital / Clinic"
          placeholder="AIIMS Delhi"
          error={errors.hospitalName?.message}
          {...register('hospitalName')}
        />
      </div>

      <Input
        id="visitDate"
        type="date"
        label="Visit Date"
        error={errors.visitDate?.message}
        {...register('visitDate')}
      />

      <Input
        id="diagnosis"
        label="Diagnosis (optional)"
        placeholder="e.g. Type 2 Diabetes"
        error={errors.diagnosis?.message}
        {...register('diagnosis')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Notes (optional)</label>
        <textarea
          rows={2}
          placeholder="Additional notes about the visit..."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          {...register('notes')}
        />
      </div>

      {/* Prescription Upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Prescription / Medical Slip (optional)
        </label>

        {file ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <FileImage size={18} className="shrink-0 text-primary" />
            <p className="flex-1 truncate text-sm text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB
            </p>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="rounded p-1 text-muted-foreground hover:text-destructive"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/30'
            }`}
          >
            <Upload size={22} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-medium text-primary">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or PDF · Max 5MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      <Button type="submit" loading={isPending} className="w-full">
        Save Medical Record
      </Button>
    </form>
  );
}
