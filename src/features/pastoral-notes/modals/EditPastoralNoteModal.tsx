import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormTextArea } from '@/components/forms/FormTextArea';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { useUpdatePastoralNote } from '../hooks/useUpdatePastoralNote';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { PastoralNote, UpdatePastoralNotePayload } from '@/types';

const editSchema = z.object({
  content: z.string().trim().optional(),
  isSensitive: z.boolean().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: PastoralNote;
}

export function EditPastoralNoteModal({ open, onOpenChange, note }: Props) {
  const updateMutation = useUpdatePastoralNote();
  const { notifyUpdated } = useNotificationActions();

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      content: note.content,
      isSensitive: note.isSensitive,
    },
  });

  // Reset form when switching between different notes
  useEffect(() => {
    form.reset({
      content: note.content,
      isSensitive: note.isSensitive,
    });
  }, [note._id, form]);

  const onSubmit = (values: z.infer<typeof editSchema>) => {
    console.log('[EditPastoralNote] dirtyFields:', form.formState.dirtyFields);
    console.log('[EditPastoralNote] values:', values);

    const dirty: Record<string, unknown> = {};
    if (form.formState.dirtyFields.content) dirty.content = values.content;
    if (form.formState.dirtyFields.isSensitive) dirty.isSensitive = values.isSensitive;

    if (Object.keys(dirty).length === 0) {
      console.log('[EditPastoralNote] No changes, closing');
      onOpenChange(false);
      return;
    }

    updateMutation.mutate(
      { id: note._id, data: dirty as UpdatePastoralNotePayload },
      {
        onSuccess: () => {
          notifyUpdated('Nota pastoral');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <FormModal key={note._id} open={open} onOpenChange={onOpenChange} title="Editar nota pastoral" size="lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
            <FormTextArea name="content" control={form.control} label="Contenido" rows={5} />
            <div className="flex items-center gap-2">
              <Checkbox
                id={`edit-sensitive-${note._id}`}
                checked={form.watch('isSensitive')}
                onCheckedChange={(c) => form.setValue('isSensitive', c === true, { shouldDirty: true })}
              />
              <Label htmlFor={`edit-sensitive-${note._id}`} className="text-sm cursor-pointer">
                Nota sensible
              </Label>
            </div>
          </div>
          <div className="flex justify-end">
            <FormSubmitButton
              isSubmitting={updateMutation.isPending}
              label="Guardar cambios"
              className="w-full sm:w-auto px-8"
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}