import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pastoralNoteService } from '../services/pastoral-note.service';
import { showToast } from '@/lib/toast';
import type { UpdatePastoralNotePayload } from '@/types';

export function useUpdatePastoralNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePastoralNotePayload }) =>
      pastoralNoteService.update(id, data),
    onSuccess: () => {
      showToast.success('Nota actualizada');
      queryClient.invalidateQueries({ queryKey: ['pastoral-notes'] });
    },
    onError: (error: Error) => showToast.error(error.message),
  });
}