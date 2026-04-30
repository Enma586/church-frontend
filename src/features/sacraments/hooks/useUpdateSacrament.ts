import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sacramentService } from '../services/sacrament.service';
import { showToast } from '@/lib/toast';
import type { UpdateSacramentPayload } from '@/types';

export function useUpdateSacrament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSacramentPayload }) =>
      sacramentService.update(id, data),
    onSuccess: () => {
      showToast.success('Sacramento actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}