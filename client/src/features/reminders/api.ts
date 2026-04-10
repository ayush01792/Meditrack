import { api } from '@/lib/axios';
import type { ApiResponse, Reminder, ReminderStatus } from '@/types';

export async function getReminders(status?: ReminderStatus): Promise<Reminder[]> {
  const { data } = await api.get<ApiResponse<Reminder[]>>('/reminders', {
    params: { status },
  });
  return data.data;
}

export async function updateReminderStatus(
  id: string,
  status: ReminderStatus,
  snoozedUntil?: string
): Promise<Reminder> {
  const { data } = await api.patch<ApiResponse<Reminder>>(`/reminders/${id}/status`, {
    status,
    snoozedUntil,
  });
  return data.data;
}
