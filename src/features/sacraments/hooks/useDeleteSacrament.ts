import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sacramentService } from '../services/sacrament.service';
import { showToast } from '@/lib/toast';

export function useDeleteSacrament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sacramentService.remove(id),
    onSuccess: () => {
      showToast.success('Sacramento eliminado');
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}