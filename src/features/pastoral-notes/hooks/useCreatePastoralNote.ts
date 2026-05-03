import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pastoralNoteService } from '../services/pastoral-note.service';
import { showToast } from '@/lib/toast';
import type { CreatePastoralNotePayload } from '@/types';

export function useCreatePastoralNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePastoralNotePayload) => pastoralNoteService.create(data),
    onSuccess: () => {
      showToast.success('Nota creada');
      queryClient.invalidateQueries({ queryKey: ['pastoral-notes'] });
    },
    onError: (error: Error) => showToast.error(error.message),
  });
}