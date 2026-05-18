import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import type { IncomeStatementQueryParams } from '@/types';

export function useIncomeStatement(params: IncomeStatementQueryParams = {}) {
  return useQuery({
    queryKey: ['reports', 'income-statement', params],
    queryFn: () => reportsService.getIncomeStatement(params),
  });
}