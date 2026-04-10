import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getReminders, updateReminderStatus } from '../api';
import type { ReminderStatus } from '@/types';

export function useReminders(status?: ReminderStatus) {
  return useQuery({
    queryKey: ['reminders', status],
    queryFn: () => getReminders(status),
    refetchInterval: 1000 * 60, // refresh every minute
  });
}

export function useUpdateReminderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      snoozedUntil,
    }: {
      id: string;
      status: ReminderStatus;
      snoozedUntil?: string;
    }) => updateReminderStatus(id, status, snoozedUntil),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      const messages: Record<ReminderStatus, string> = {
        taken: 'Dose marked as taken!',
        missed: 'Marked as missed.',
        snoozed: 'Reminder snoozed for 30 minutes.',
        pending: 'Status updated.',
      };
      toast.success(messages[status]);
    },
  });
}
