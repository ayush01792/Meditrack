import { api } from '@/lib/axios';
import type { ApiResponse, Medicine, MedicinePayload, PaginatedResponse } from '@/types';

export async function getMedicines(page = 1, limit = 20): Promise<PaginatedResponse<Medicine>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Medicine>>>('/medicines', {
    params: { page, limit },
  });
  return data.data;
}

export async function createMedicine(payload: MedicinePayload): Promise<Medicine> {
  const { data } = await api.post<ApiResponse<Medicine>>('/medicines', payload);
  return data.data;
}

export async function updateMedicine(id: string, payload: Partial<MedicinePayload>): Promise<Medicine> {
  const { data } = await api.patch<ApiResponse<Medicine>>(`/medicines/${id}`, payload);
  return data.data;
}

export async function deleteMedicine(id: string): Promise<void> {
  await api.delete(`/medicines/${id}`);
}

export async function toggleMedicine(id: string, isActive: boolean): Promise<Medicine> {
  const { data } = await api.patch<ApiResponse<Medicine>>(`/medicines/${id}/toggle`, { isActive });
  return data.data;
}
