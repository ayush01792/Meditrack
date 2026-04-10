import { api } from '@/lib/axios';

export async function downloadHealthReport(): Promise<Blob> {
  const { data } = await api.get('/reports/pdf', { responseType: 'blob' });
  return data;
}

export async function getDoctorShareToken(): Promise<{ token: string; expiresAt: string }> {
  const { data } = await api.post('/reports/share-token');
  return data.data;
}
