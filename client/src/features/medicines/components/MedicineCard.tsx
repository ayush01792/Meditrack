import { useState } from 'react';
import { Clock, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { formatDate, formatFrequency } from '@/lib/utils';
import type { Medicine } from '@/types';
import { useDeleteMedicine, useToggleMedicine } from '../hooks/useMedicines';
import MedicineForm from './MedicineForm';

interface Props {
  medicine: Medicine;
}

const FORM_EMOJI: Record<string, string> = {
  tablet: '💊',
  capsule: '💉',
  syrup: '🧴',
  injection: '💉',
  drops: '💧',
  other: '🩺',
};

export default function MedicineCard({ medicine }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const { mutate: deleteMed, isPending: deleting } = useDeleteMedicine();
  const { mutate: toggle, isPending: toggling } = useToggleMedicine();

  return (
    <Card className={`transition-opacity ${!medicine.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          {/* Left */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
              {FORM_EMOJI[medicine.form] ?? '💊'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{medicine.name}</p>
                <Badge variant={medicine.isActive ? 'default' : 'secondary'}>
                  {medicine.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {medicine.dosage} · {medicine.form}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={11} />
                  {formatFrequency(medicine.frequency)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {medicine.times.join(', ')}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Started {formatDate(medicine.startDate)}
                {medicine.endDate && ` · Ends ${formatDate(medicine.endDate)}`}
              </p>
              {medicine.notes && (
                <p className="mt-1 text-xs italic text-muted-foreground">"{medicine.notes}"</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => toggle({ id: medicine.id, isActive: !medicine.isActive })}
              disabled={toggling}
              className="rounded-md p-1.5 text-muted-foreground hover:text-primary transition-colors"
              title={medicine.isActive ? 'Deactivate' : 'Activate'}
            >
              {medicine.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            </button>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <button className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 size={15} />
                </button>
              </DialogTrigger>
              <DialogContent title="Edit Medicine" description="Update the medicine details below.">
                <MedicineForm medicine={medicine} onSuccess={() => setEditOpen(false)} />
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              loading={deleting}
              onClick={() => deleteMed(medicine.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={15} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
