import { useQuery } from '@tanstack/react-query';
import { addressService } from '../services/address.service';

/**
 * Fetches municipalities filtered by departmentId.
 * Query is disabled when no department is selected to avoid a wildcard request.
 */
export function useMunicipalities(departmentId?: string) {
  return useQuery({
    queryKey: ['municipalities', { departmentId }],
    queryFn: () => addressService.getMunicipalities({ departmentId, limit: 300 }),
    select: (response) => response.data ?? [],
    enabled: !!departmentId,
    staleTime: 10 * 60 * 1000,
  });
}