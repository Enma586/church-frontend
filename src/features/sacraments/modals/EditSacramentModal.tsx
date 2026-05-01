import { useEffect, useMemo } from 'react';
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
import { SACRAMENT_TYPES, getAvailableSacramentTypes, type SacramentType } from '@/constants/sacrament-types';
import type { Sacrament, UpdateSacramentPayload } from '@/types';

const editSchema = z.object({
  type: z.enum(SACRAMENT_TYPES).optional(),
  date: z.string().optional(),
  place: z.string().trim().optional(),
  celebrant: z.string().trim().optional(),
  godparents: z.array(z.object({
    name: z.string().trim().optional(),
    role: z.string().trim().optional(),
  })).optional(),
}).refine(
  (data) => {
    // date only required when type is NOT "Ninguno"
    if (data.type !== "Ninguno" && (!data.date || data.date.trim() === "")) {
      return false;
    }
    return true;
  },
  { message: "La fecha es requerida", path: ["date"] },
);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sacrament: Sacrament;
}

/**
 * Upgrade modal for a sacrament record.
 * Shows types ABOVE the current level.
 */
export function EditSacramentModal({ open, onOpenChange, sacrament }: Props) {
  const updateMutation = useUpdateSacrament();
  const { notifyUpdated } = useNotificationActions();

  // Renombramos la variable local para no chocar con el form.watch
  const initialSacramentType = sacrament.type as SacramentType;

  // Available types to upgrade to 
  const upgradeOptions = useMemo(() => {
    const existing = [initialSacramentType];
    const available = getAvailableSacramentTypes(existing);
    return available; 
  }, [initialSacramentType]);

  const typeOptions = upgradeOptions.map((t) => ({ value: t, label: t }));

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      type: initialSacramentType as typeof SACRAMENT_TYPES[number],
      // Validamos que exista sacrament.date antes de hacer el slice
      date: sacrament.date ? sacrament.date.slice(0, 10) : '',
      place: sacrament.place ?? '',
      celebrant: sacrament.celebrant ?? '',
      godparents: sacrament.godparents?.length ? sacrament.godparents : [{ name: '', role: '' }],
    },
  });

  // 1. AQUÍ AGREGAMOS EL WATCH
  // Observa en tiempo real lo que el usuario selecciona en el FormSelect
  const selectedType = form.watch('type');

  useEffect(() => {
    form.reset({
      type: initialSacramentType,
      date: sacrament.date ? sacrament.date.slice(0, 10) : '',
      place: sacrament.place ?? '',
      celebrant: sacrament.celebrant ?? '',
      godparents: sacrament.godparents?.length ? sacrament.godparents : [{ name: '', role: '' }],
    });
  }, [sacrament._id, form, initialSacramentType]);

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'godparents' });

  const onSubmit = (values: z.infer<typeof editSchema>) => {
    const dirty: Record<string, unknown> = {};
    const keys = ['type', 'date', 'place', 'celebrant'] as const;
    for (const k of keys) if (form.formState.dirtyFields[k]) dirty[k] = values[k];
    if (form.formState.dirtyFields.godparents) dirty.godparents = values.godparents;

    if (!Object.keys(dirty).length) { onOpenChange(false); return; }

    updateMutation.mutate(
      { id: sacrament._id, data: dirty as UpdateSacramentPayload },
      { onSuccess: () => { notifyUpdated('Sacramento', values.type ?? sacrament.type); onOpenChange(false); } },
    );
  };

  return (
    <FormModal key={sacrament._id} open={open} onOpenChange={onOpenChange} title="Actualizar sacramento" size="5xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                
                {/* Lógica para mostrar la mejora o el estado actual */}
                {upgradeOptions.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Actual: <strong>{initialSacramentType}</strong>
                      {initialSacramentType === 'Primera Comunión' && ' (incluye Bautismo)'}
                      {initialSacramentType === 'Confirmación' && ' (incluye Bautismo + Primera Comunión)'}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormSelect name="type" control={form.control} label="Promover a" options={typeOptions} />
                      
                      {/* 2. AQUÍ ENVOLVEMOS LA FECHA */}
                      {selectedType !== 'Ninguno' && (
                         <FormDatePicker name="date" control={form.control} label="Fecha" />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Este miembro ya tiene <strong>{initialSacramentType}</strong>. No hay nivel superior disponible.
                    </p>
                  </div>
                )}

                {/* 3. OPCIONAL: Si no hay sacramento, tampoco hay lugar ni celebrante */}
                {selectedType !== 'Ninguno' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput name="place" control={form.control} label="Lugar" />
                    <FormInput name="celebrant" control={form.control} label="Celebrante" />
                  </div>
                )}
              </div>
            </div>

            {/* 4. OPCIONAL: Ocultar los padrinos si es "Ninguno" */}
            {selectedType !== 'Ninguno' && (
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
            )}
          </div>

          {/* El botón de Submit sigue siendo válido */}
          {upgradeOptions.length > 0 && (
            <div className="flex justify-end">
              <FormSubmitButton isSubmitting={updateMutation.isPending} label="Guardar cambios" className="w-full sm:w-auto px-8" />
            </div>
          )}
        </form>
      </Form>
    </FormModal>
  );
}