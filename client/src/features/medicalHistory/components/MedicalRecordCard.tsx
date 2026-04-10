import { useState } from 'react';
import { Hospital, User, Calendar, FileText, Trash2, Eye, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { MedicalRecord } from '../api';
import { useDeleteMedicalRecord } from '../hooks/useMedicalHistory';

interface Props {
  record: MedicalRecord;
}

export default function MedicalRecordCard({ record }: Props) {
  const { mutate: deleteRecord, isPending } = useDeleteMedicalRecord();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isPdf = record.prescriptionUrl?.endsWith('.pdf');

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Doctor & Hospital */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <User size={14} className="text-primary shrink-0" />
                  {record.doctorName}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Hospital size={14} className="shrink-0" />
                  {record.hospitalName}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar size={12} className="shrink-0" />
                  {formatDate(record.visitDate)}
                </span>
              </div>

              {/* Diagnosis */}
              {record.diagnosis && (
                <p className="text-sm text-foreground mb-1">
                  <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                </p>
              )}

              {/* Notes */}
              {record.notes && (
                <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1">
                  <FileText size={12} className="mt-0.5 shrink-0" />
                  {record.notes}
                </p>
              )}

              {/* Prescription preview */}
              {record.prescriptionUrl && (
                <div className="mt-3">
                  {isPdf ? (
                    <a
                      href={record.prescriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary underline-offset-4 hover:underline"
                    >
                      <FileText size={13} /> View Prescription PDF
                    </a>
                  ) : (
                    <button
                      onClick={() => setLightboxOpen(true)}
                      className="group relative overflow-hidden rounded-lg border border-border"
                    >
                      <img
                        src={record.prescriptionUrl}
                        alt="Prescription"
                        className="h-24 w-40 object-cover transition-opacity group-hover:opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                        <Eye size={18} className="text-white" />
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              loading={isPending}
              onClick={() => deleteRecord(record.id)}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={15} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Lightbox */}
      {lightboxOpen && record.prescriptionUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>
          <img
            src={record.prescriptionUrl}
            alt="Prescription"
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
