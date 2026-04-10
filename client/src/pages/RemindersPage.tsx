import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import ReminderCard from '@/features/reminders/components/ReminderCard';
import { useReminders } from '@/features/reminders/hooks/useReminders';
import type { ReminderStatus } from '@/types';

const TABS: { label: string; value: ReminderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Taken', value: 'taken' },
  { label: 'Missed', value: 'missed' },
  { label: 'Snoozed', value: 'snoozed' },
];

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState<ReminderStatus | 'all'>('all');
  const { data: reminders = [], isLoading } = useReminders(
    activeTab === 'all' ? undefined : activeTab
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reminders</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your medication schedule and track doses
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Bell size={36} className="text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-foreground">No reminders found</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Reminders are auto-generated from your medicine schedule
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}
    </div>
  );
}
