import { useQuery } from '@tanstack/react-query';
import { sacramentService } from '../services/sacrament.service';

export function useSacrament(id: string) {
  return useQuery({
    queryKey: ['sacraments', id],
    queryFn: () => sacramentService.getById(id),
    enabled: !!id,
    retry: false,
  });
}