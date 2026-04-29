import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService } from '../services/member.service';
import { showToast } from '@/lib/toast';

/**
 * Mutation hook to delete a member.
 * Invalidates the list cache on success.
 */
export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => memberService.remove(id),
    onSuccess: () => {
      showToast.success('Miembro eliminado');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}