import { useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMedicalRecords } from '@/features/medicalHistory/hooks/useMedicalHistory';
import MedicalRecordCard from '@/features/medicalHistory/components/MedicalRecordCard';
import MedicalRecordForm from '@/features/medicalHistory/components/MedicalRecordForm';

export default function MedicalHistoryPage() {
  const { data: records, isLoading } = useMedicalRecords();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medical History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Store and view your past hospital visits and prescriptions.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Record
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : records && records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record) => (
            <MedicalRecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ClipboardList size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No records yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your first medical record to get started.
          </p>
          <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => setDialogOpen(true)}>
            <Plus size={14} />
            Add Record
          </Button>
        </div>
      )}

      {/* Add Record Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title="Add Medical Record">
          <MedicalRecordForm onSuccess={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
