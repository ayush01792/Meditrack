import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteVital, getVitals, logVital } from '../api';
import type { VitalPayload, VitalType } from '@/types';

export function useVitals(type?: VitalType) {
  return useQuery({
    queryKey: ['vitals', type],
    queryFn: () => getVitals(type),
  });
}

export function useLogVital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VitalPayload) => logVital(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vitals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Vital logged!');
    },
  });
}

export function useDeleteVital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVital(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vitals'] });
      toast.success('Vital entry deleted.');
    },
  });
}
