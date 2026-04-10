import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getMedicalRecords, createMedicalRecord, deleteMedicalRecord } from '../api';
import type { MedicalRecordPayload } from '../api';

const KEY = ['medical-records'];

export function useMedicalRecords() {
  return useQuery({ queryKey: KEY, queryFn: getMedicalRecords });
}

export function useCreateMedicalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MedicalRecordPayload) => createMedicalRecord(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Medical record added!');
    },
  });
}

export function useDeleteMedicalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMedicalRecord(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Record deleted.');
    },
  });
}
