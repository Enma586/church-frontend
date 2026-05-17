import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import type { BalanceSheetQueryParams } from '@/types';

export function useBalanceSheet(params: BalanceSheetQueryParams = {}) {
  return useQuery({
    queryKey: ['reports', 'balance-sheet', params],
    queryFn: () => reportsService.getBalanceSheet(params),
  });
}