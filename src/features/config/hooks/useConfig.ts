/**
 * @fileoverview React Query hooks for system configuration.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configService } from '../services/config.service';
import { showToast } from '@/lib/toast';
import type { UpdateConfigurationPayload } from '@/types';

export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: () => configService.get(),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: UpdateConfigurationPayload & Record<string, unknown>,
    ) => configService.update(data),
    onSuccess: () => {
      showToast.success('Configuración actualizada');
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}