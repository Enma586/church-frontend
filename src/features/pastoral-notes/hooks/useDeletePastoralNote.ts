import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pastoralNoteService } from '../services/pastoral-note.service'
import { showToast } from '@/lib/toast'

export function useDeletePastoralNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pastoralNoteService.remove(id),
        onSuccess: () => {
            showToast.success('Nota eliminada')
            queryClient.invalidateQueries({ queryKey: ['pastoral-notes']});
        },
        onError : (error: Error) => showToast.error(error.message),
    });
}