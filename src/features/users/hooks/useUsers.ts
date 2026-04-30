import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { UserQueryParams } from '@/types';

export function useUsers(params: UserQueryParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAll(params),
  });
}