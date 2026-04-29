import { useQuery } from '@tanstack/react-query';
import { addressService } from '../services/address.service';

export function useMunicipalities(departmentId?: string) {
  return useQuery({
    queryKey: ['municipalities', { departmentId }],
    queryFn: () => addressService.getMunicipalities({ departmentId, limit: 100 }),
    select: (response) => response.data ?? [],
    enabled: !!departmentId,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}