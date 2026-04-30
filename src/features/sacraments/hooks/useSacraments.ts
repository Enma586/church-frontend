import { useQuery } from '@tanstack/react-query';
import { sacramentService } from '../services/sacrament.service';
import type { SacramentQueryParams } from '@/types';

export function useSacraments(params: SacramentQueryParams = {}) {
  return useQuery({
    queryKey: ['sacraments', params],
    queryFn: () => sacramentService.getAll(params),
    retry: false,
  });
}