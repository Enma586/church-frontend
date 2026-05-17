import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import type { LedgerQueryParams } from '@/types';

export function useLedger(params: LedgerQueryParams) {
  return useQuery({
    queryKey: ['reports', 'ledger', params],
    queryFn: () => reportsService.getLedger(params),
    enabled: !!params.accountId,
  });
}