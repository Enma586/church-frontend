import { useQuery } from '@tanstack/react-query';
import { memberService } from '../services/member.service';
import type { MemberQueryParams } from '@/types';

/**
 * Fetches a paginated, filtered list of members.
 * The query key includes all filter params so changing them triggers a refetch.
 */
export function useMembers(params: MemberQueryParams = {}) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => memberService.getAll(params),
  });
}