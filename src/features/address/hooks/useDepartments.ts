import { useQuery } from '@tanstack/react-query';
import { addressService } from '../services/address.service';

export function useDepartments(search?: string) {
  return useQuery({
    queryKey: ['departments', { search }],
    queryFn: () => addressService.getDepartments({ search, limit: 100 }),
    select: (response) => response.data ?? [],
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}