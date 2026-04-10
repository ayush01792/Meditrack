import { Clock, CheckCircle2, XCircle, AlarmClock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatTime } from '@/lib/utils';
import type { Reminder, ReminderStatus } from '@/types';

interface Props {
  reminders?: Reminder[];
  loading?: boolean;
}

const STATUS_CONFIG: Record<ReminderStatus, { label: string; icon: typeof CheckCircle2; variant: 'success' | 'destructive' | 'warning' | 'default' }> = {
  taken: { label: 'Taken', icon: CheckCircle2, variant: 'success' },
  missed: { label: 'Missed', icon: XCircle, variant: 'destructive' },
  snoozed: { label: 'Snoozed', icon: AlarmClock, variant: 'warning' },
  pending: { label: 'Pending', icon: Clock, variant: 'default' },
};

export default function TodayReminders({ reminders = [], loading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Reminders</CardTitle>
        <p className="text-sm text-muted-foreground">
          {reminders.length} scheduled for today
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Clock size={28} className="text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No reminders for today</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {reminders.map((reminder) => {
              const config = STATUS_CONFIG[reminder.status];
              const Icon = config.icon;
              return (
                <div
                  key={reminder.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {reminder.medicineName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reminder.dosage} · {formatTime(reminder.scheduledAt)}
                    </p>
                  </div>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
