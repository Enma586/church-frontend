import { useQuery } from '@tanstack/react-query';
import { accountService } from '../services/account.service';
import type { AccountQueryParams } from '@/types';

export function useAccounts(params: AccountQueryParams = {}) {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => accountService.getAll(params),
  });
}