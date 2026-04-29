import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService } from '../services/member.service';
import { showToast } from '@/lib/toast';
import type { CreateMemberPayload } from '@/types';

/**
 * Mutation hook to create a new member.
 * Invalidates the member list cache on success so the table refreshes automatically.
 */
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemberPayload) => memberService.create(data),
    onSuccess: () => {
      showToast.success('Miembro creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}