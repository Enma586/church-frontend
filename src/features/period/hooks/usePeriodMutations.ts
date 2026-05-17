import { useMutation, useQueryClient } from '@tanstack/react-query';
import { periodService } from '../services/period.service';
import { showToast } from '@/lib/toast';
import type { ClosePeriodPayload } from '@/types';

export function useClosePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClosePeriodPayload) => periodService.close(data),
    onSuccess: () => {
      showToast.success('Período contable cerrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

export function useReopenPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => periodService.reopen(),
    onSuccess: () => {
      showToast.success('Período contable reabierto');
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}