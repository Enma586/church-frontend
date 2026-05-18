import { useQuery } from '@tanstack/react-query';
import { cashClosingService } from '../services/cash-closing.service';
import type { CashClosingQueryParams } from '@/types';

export function useCashClosings(params: CashClosingQueryParams = {}) {
  return useQuery({
    queryKey: ['cash-closings', params],
    queryFn: () => cashClosingService.getAll(params),
  });
}

export function useDenominations() {
  return useQuery({
    queryKey: ['denominations'],
    queryFn: () => cashClosingService.getDenominations(),
    staleTime: Infinity,
  });
}