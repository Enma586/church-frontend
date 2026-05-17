import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import type { TrialBalanceQueryParams } from '@/types';

export function useTrialBalance(params: TrialBalanceQueryParams = {}) {
  return useQuery({
    queryKey: ['reports', 'trial-balance', params],
    queryFn: () => reportsService.getTrialBalance(params),
  });
}