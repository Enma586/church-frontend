import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cashClosingService } from '../services/cash-closing.service';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
import type { CreateCashClosingPayload } from '@/types';

export function useCreateCashClosing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCashClosingPayload) => cashClosingService.create(data),
    onSuccess: () => {
      showToast.success('Cierre de caja registrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['cash-closings'] });
    },
    onError: (error: unknown) => {
      showToast.error(humanizeError(error));
    },
  });
}