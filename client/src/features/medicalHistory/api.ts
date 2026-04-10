import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface MedicalRecord {
  id: string;
  doctorName: string;
  hospitalName: string;
  visitDate: string;
  diagnosis: string | null;
  notes: string | null;
  prescriptionUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordPayload {
  doctorName: string;
  hospitalName: string;
  visitDate: string;
  diagnosis?: string;
  notes?: string;
  prescription?: File;
}

export async function getMedicalRecords(): Promise<MedicalRecord[]> {
  const { data } = await api.get<ApiResponse<MedicalRecord[]>>('/medical-records');
  return data.data;
}

export async function createMedicalRecord(payload: MedicalRecordPayload): Promise<MedicalRecord> {
  const form = new FormData();
  form.append('doctorName', payload.doctorName);
  form.append('hospitalName', payload.hospitalName);
  form.append('visitDate', payload.visitDate);
  if (payload.diagnosis) form.append('diagnosis', payload.diagnosis);
  if (payload.notes) form.append('notes', payload.notes);
  if (payload.prescription) form.append('prescription', payload.prescription);

  const { data } = await api.post<ApiResponse<MedicalRecord>>('/medical-records', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  await api.delete(`/medical-records/${id}`);
}
