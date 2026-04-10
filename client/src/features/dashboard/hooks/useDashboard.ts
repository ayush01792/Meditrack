import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
