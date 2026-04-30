import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sacramentService } from '../services/sacrament.service';
import { showToast } from '@/lib/toast';
import type { CreateSacramentPayload } from '@/types';

export function useCreateSacrament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSacramentPayload) => sacramentService.create(data),
    onSuccess: () => {
      showToast.success('Sacramento registrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}