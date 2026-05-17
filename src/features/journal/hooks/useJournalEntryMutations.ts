import { useMutation, useQueryClient } from '@tanstack/react-query';
import { journalEntryService } from '../services/journal-entry.service';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
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
    onError: (error: unknown) => {
      showToast.error(humanizeError(error));
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
      showToast.success('Asiento actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error: unknown) => {
      showToast.error(humanizeError(error));
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalEntryService.remove(id),
    onSuccess: () => {
      showToast.success('Asiento eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error: unknown) => {
      showToast.error(humanizeError(error));
    },
  });
}