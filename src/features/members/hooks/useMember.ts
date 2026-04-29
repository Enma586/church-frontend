import { useQuery } from '@tanstack/react-query';
import { memberService } from '../services/member.service';

/**
 * Fetches a single member by ID.
 * Disabled when id is falsy (e.g. empty string on initial render).
 */
export function useMember(id: string) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => memberService.getById(id),
    enabled: !!id,
  });
}