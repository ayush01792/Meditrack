import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createMedicine, deleteMedicine, getMedicines, toggleMedicine, updateMedicine } from '../api';
import type { MedicinePayload } from '@/types';

const MEDICINES_KEY = ['medicines'];

export function useMedicines() {
  return useQuery({
    queryKey: MEDICINES_KEY,
    queryFn: () => getMedicines(),
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MedicinePayload) => createMedicine(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEDICINES_KEY });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Medicine added successfully!');
    },
  });
}

export function useUpdateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MedicinePayload> }) =>
      updateMedicine(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEDICINES_KEY });
      toast.success('Medicine updated!');
    },
  });
}

export function useDeleteMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMedicine(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEDICINES_KEY });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Medicine removed.');
    },
  });
}

export function useToggleMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleMedicine(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEDICINES_KEY });
    },
  });
}
