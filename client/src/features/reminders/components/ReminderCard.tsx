import { CheckCircle2, XCircle, AlarmClock, Clock } from 'lucide-react';
import { addMinutes } from 'date-fns';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatTime, formatDate } from '@/lib/utils';
import type { Reminder } from '@/types';
import { useUpdateReminderStatus } from '../hooks/useReminders';

interface Props {
  reminder: Reminder;
}

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default' }> = {
  taken: { label: 'Taken', variant: 'success' },
  missed: { label: 'Missed', variant: 'destructive' },
  snoozed: { label: 'Snoozed', variant: 'warning' },
  pending: { label: 'Pending', variant: 'default' },
};

export default function ReminderCard({ reminder }: Props) {
  const { mutate: updateStatus, isPending } = useUpdateReminderStatus();
  const isPending_ = reminder.status === 'pending' || reminder.status === 'snoozed';
  const badge = STATUS_BADGE[reminder.status];

  function snooze() {
    const snoozedUntil = addMinutes(new Date(), 30).toISOString();
    updateStatus({ id: reminder.id, status: 'snoozed', snoozedUntil });
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Clock size={18} className="text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-foreground">{reminder.medicineName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {reminder.dosage} · {formatDate(reminder.scheduledAt)} at{' '}
                  {formatTime(reminder.scheduledAt)}
                </p>
                {reminder.snoozedUntil && reminder.status === 'snoozed' && (
                  <p className="text-xs text-yellow-500 mt-1">
                    Snoozed until {formatTime(reminder.snoozedUntil)}
                  </p>
                )}
                {reminder.takenAt && (
                  <p className="text-xs text-green-500 mt-1">
                    Taken at {formatTime(reminder.takenAt)}
                  </p>
                )}
              </div>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>

            {isPending_ && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  loading={isPending}
                  onClick={() => updateStatus({ id: reminder.id, status: 'taken' })}
                >
                  <CheckCircle2 size={13} /> Mark Taken
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 text-xs"
                  onClick={snooze}
                  disabled={isPending}
                >
                  <AlarmClock size={13} /> Snooze 30m
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => updateStatus({ id: reminder.id, status: 'missed' })}
                  disabled={isPending}
                >
                  <XCircle size={13} /> Skip
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
