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
import { useUpdateSacrament } from '../hooks/useUpdateSacrament';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { Button } from '@/components/ui/button';
import { SACRAMENT_TYPES } from '@/constants/sacrament-types';
import type { Sacrament, UpdateSacramentPayload } from '@/types';

const typeOptions = SACRAMENT_TYPES.map((t) => ({ value: t, label: t }));

const editSchema = z.object({
  type: z.enum(SACRAMENT_TYPES).optional(),
  date: z.string().optional(),
  place: z.string().trim().optional(),
  celebrant: z.string().trim().optional(),
  godparents: z.array(z.object({
    name: z.string().trim().optional(),
    role: z.string().trim().optional(),
  })).optional(),
});

interface EditSacramentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sacrament: Sacrament;
}

export function EditSacramentModal({ open, onOpenChange, sacrament }: EditSacramentModalProps) {
  const updateMutation = useUpdateSacrament();
  const { notifyUpdated } = useNotificationActions();

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      type: sacrament.type as typeof SACRAMENT_TYPES[number],
      date: sacrament.date.slice(0, 10),
      place: sacrament.place ?? '',
      celebrant: sacrament.celebrant ?? '',
      godparents: sacrament.godparents?.length ? sacrament.godparents : [{ name: '', role: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'godparents',
  });

  const onSubmit = (values: z.infer<typeof editSchema>) => {
    const dirty: Record<string, unknown> = {};
    const fields = ['type', 'date', 'place', 'celebrant'] as const;
    for (const key of fields) {
      if (form.formState.dirtyFields[key]) dirty[key] = values[key];
    }
    if (form.formState.dirtyFields.godparents) dirty.godparents = values.godparents;

    if (Object.keys(dirty).length === 0) { onOpenChange(false); return; }

    updateMutation.mutate(
      { id: sacrament._id, data: dirty as UpdateSacramentPayload },
      { onSuccess: () => { notifyUpdated('Sacramento', values.type ?? sacrament.type); onOpenChange(false); } },
    );
  };

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title="Editar sacramento" size="5xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect name="type" control={form.control} label="Tipo" options={typeOptions} />
                  <FormDatePicker name="date" control={form.control} label="Fecha" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput name="place" control={form.control} label="Lugar" />
                  <FormInput name="celebrant" control={form.control} label="Celebrante" />
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold">Padrinos</h4>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', role: '' })}>
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
            <FormSubmitButton isSubmitting={updateMutation.isPending} label="Guardar cambios" className="w-full sm:w-auto px-8" />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}