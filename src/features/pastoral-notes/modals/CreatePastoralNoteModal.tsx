import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormTextArea } from '@/components/forms/FormTextArea';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { useCreatePastoralNote } from '../hooks/useCreatePastoralNote';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { CreatePastoralNotePayload } from '@/types';

const createSchema = z.object({
  memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Selecciona un miembro'),
  content: z.string().trim().min(1, 'Requerido'),
  isSensitive: z.boolean().default(false),
});

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export function CreatePastoralNoteModal({ open, onOpenChange }: Props) {
  const createMutation = useCreatePastoralNote();
  const { notifyCreated } = useNotificationActions();
  const { data: membersData } = useMembers({ limit: 100 });
  const members = membersData?.data ?? [];

  const memberOptions = members.map((m) => ({ value: m._id, label: m.fullName }));

  const form = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { memberId: '', content: '', isSensitive: false },
  });

  const onSubmit = async (values: z.infer<typeof createSchema>) => {
    try {
      await createMutation.mutateAsync(values as CreatePastoralNotePayload);
      notifyCreated('Nota pastoral');
      form.reset();
      onOpenChange(false);
    } catch {}
  };

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title="Nueva nota pastoral" size="lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
            <FormSelect name="memberId" control={form.control} label="Miembro" options={memberOptions} placeholder="Seleccionar miembro..." />
            <FormTextArea name="content" control={form.control} label="Contenido" placeholder="Escribe la nota pastoral..." rows={5} />
            <div className="flex items-center gap-2">
              <Checkbox
                id="note-sensitive"
                checked={form.watch('isSensitive')}
                onCheckedChange={(c) => form.setValue('isSensitive', c === true)}
              />
              <Label htmlFor="note-sensitive" className="text-sm cursor-pointer">
                Marcar como nota sensible (visible solo para Coordinadores)
              </Label>
            </div>
          </div>
          <div className="flex justify-end">
            <FormSubmitButton isSubmitting={createMutation.isPending} label="Crear nota" className="w-full sm:w-auto px-8" />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}