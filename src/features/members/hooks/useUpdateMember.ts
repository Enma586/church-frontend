import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService } from '../services/member.service';
import { showToast } from '@/lib/toast';
import type { UpdateMemberPayload } from '@/types';

/**
 * Mutation hook to update an existing member.
 * Invalidates both the list cache and the individual member cache.
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberPayload }) =>
      memberService.update(id, data),
    onSuccess: (_, variables) => {
      showToast.success('Miembro actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', variables.id] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}