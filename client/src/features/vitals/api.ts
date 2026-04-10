import { api } from '@/lib/axios';
import type { ApiResponse, VitalEntry, VitalPayload, VitalType } from '@/types';

export async function getVitals(type?: VitalType, limit = 30): Promise<VitalEntry[]> {
  const { data } = await api.get<ApiResponse<VitalEntry[]>>('/vitals', {
    params: { type, limit },
  });
  return data.data;
}

export async function logVital(payload: VitalPayload): Promise<VitalEntry> {
  const { data } = await api.post<ApiResponse<VitalEntry>>('/vitals', payload);
  return data.data;
}

export async function deleteVital(id: string): Promise<void> {
  await api.delete(`/vitals/${id}`);
}
