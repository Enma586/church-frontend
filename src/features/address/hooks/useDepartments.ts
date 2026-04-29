import { useQuery } from '@tanstack/react-query';
import { addressService } from '../services/address.service';

/**
 * Fetches the full department list (up to 100 records).
 * Cached for 10 minutes — departments are static data.
 */
export function useDepartments(search?: string) {
  return useQuery({
    queryKey: ['departments', { search }],
    queryFn: () => addressService.getDepartments({ search, limit: 100 }),
    select: (response) => response.data ?? [],
    staleTime: 10 * 60 * 1000,
  });
}