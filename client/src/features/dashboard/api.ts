import { api } from '@/lib/axios';
import type { ApiResponse, DashboardSummary } from '@/types';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
  return data.data;
}
