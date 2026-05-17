import { useMutation, useQueryClient } from '@tanstack/react-query';
import { journalEntryService } from '../services/journal-entry.service';
import { showToast } from '@/lib/toast';
import type {
  CreateJournalEntryPayload,
  UpdateJournalEntryPayload,
} from '@/types';

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJournalEntryPayload) =>
      journalEntryService.create(data),
    onSuccess: () => {
      showToast.success('Asiento contable creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateJournalEntryPayload;
    }) => journalEntryService.update(id, data),
    onSuccess: () => {
      showToast.success('Asiento actualizado');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalEntryService.remove(id),
    onSuccess: () => {
      showToast.success('Asiento eliminado');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}