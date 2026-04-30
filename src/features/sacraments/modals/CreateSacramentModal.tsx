import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { useCreateSacrament } from '../hooks/useCreateSacrament';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { Button } from '@/components/ui/button';
import { SACRAMENT_TYPES } from '@/constants/sacrament-types';
import type { CreateSacramentPayload } from '@/types';

const typeOptions = SACRAMENT_TYPES.map((t) => ({ value: t, label: t }));

const godparentSchema = z.object({
  name: z.string().trim().optional(),
  role: z.string().trim().default('Padrino/Madrina'),
});

const createSchema = z.object({
  memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Selecciona un miembro'),
  type: z.enum(SACRAMENT_TYPES),
  date: z.string().min(1, 'Requerida'),
  place: z.string().trim().optional(),
  celebrant: z.string().trim().optional(),
  godparents: z.array(godparentSchema).optional(),
});

interface CreateSacramentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSacramentModal({ open, onOpenChange }: CreateSacramentModalProps) {
  const createMutation = useCreateSacrament();
  const { notifyCreated } = useNotificationActions();
  const { data: membersData } = useMembers({ limit: 100 });
  const members = membersData?.data ?? [];

  const memberOptions = members.map((m) => ({
    value: m._id,
    label: m.fullName,
  }));

  const form = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: {
      memberId: '',
      type: 'Bautismo' as const,
      date: '',
      place: '',
      celebrant: '',
      godparents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'godparents',
  });

  const onSubmit = async (values: z.infer<typeof createSchema>) => {
    try {
      await createMutation.mutateAsync(values as CreateSacramentPayload);
      notifyCreated('Sacramento', values.type);
      form.reset();
      onOpenChange(false);
    } catch {}
  };

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title="Nuevo sacramento" size="5xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <FormSelect name="memberId" control={form.control} label="Miembro" options={memberOptions} placeholder="Seleccionar miembro..." />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect name="type" control={form.control} label="Tipo de sacramento" options={typeOptions} />
                  <FormDatePicker name="date" control={form.control} label="Fecha" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput name="place" control={form.control} label="Lugar" placeholder="Parroquia..." />
                  <FormInput name="celebrant" control={form.control} label="Celebrante" placeholder="Padre..." />
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold">Padrinos</h4>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', role: 'Padrino/Madrina' })}>
                  <Plus className="mr-1.5 h-4 w-4" /> Agregar
                </Button>
              </div>
              <div className="space-y-3 flex-1">
                {fields.map((f, i) => (
                  <div key={f.id} className="flex items-start gap-3 p-3 rounded-md border bg-background">
                    <div className="flex-1 space-y-2">
                      <FormInput name={`godparents.${i}.name`} control={form.control} label="Nombre" />
                      <FormInput name={`godparents.${i}.role`} control={form.control} label="Rol" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="mt-6 h-8 w-8 text-destructive" onClick={() => remove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <FormSubmitButton isSubmitting={createMutation.isPending} label="Registrar sacramento" className="w-full sm:w-auto px-8" />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}