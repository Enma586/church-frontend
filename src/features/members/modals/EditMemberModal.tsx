//import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, User, MapPin, Users } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { DepartmentSelect } from '@/features/address/components/DepartmentSelect';
import { MunicipalitySelect } from '@/features/address/components/MunicipalitySelect';
import { useUpdateMember } from '../hooks/useUpdateMember';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { GENDERS } from '@/constants/gender';
import { MEMBER_STATUSES } from '@/constants/member-status';
import { FAMILY_RELATIONSHIPS } from '@/constants/family-relationship';
import type { Member, UpdateMemberPayload } from '@/types';

const genderOptions = GENDERS.map((g) => ({ value: g, label: g }));
const statusOptions = MEMBER_STATUSES.map((s) => ({ value: s, label: s }));
const relationshipOptions = FAMILY_RELATIONSHIPS.map((r) => ({ value: r, label: r }));

const familyMemberSchema = z.object({
  name: z.string().trim().min(1, 'Requerido'),
  relationship: z.enum(FAMILY_RELATIONSHIPS),
  contactNumber: z.string().trim().optional(),
  isMember: z.boolean().default(false),
});

const editSchema = z.object({
  fullName: z.string().trim().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(GENDERS).optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email('Correo inválido').optional().or(z.literal('')),
  departmentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().or(z.literal('')),
  municipalityId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().or(z.literal('')),
  addressDetails: z.string().trim().optional(),
  family: z.array(familyMemberSchema).optional(),
  status: z.enum(MEMBER_STATUSES).optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
      <Icon className="h-5 w-5" />
      <h3 className="uppercase tracking-wider">{title}</h3>
    </div>
  );
}

export function EditMemberModal({ open, onOpenChange, member }: EditMemberModalProps) {
  const updateMutation = useUpdateMember();
  const { notifyUpdated } = useNotificationActions();

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      fullName: member.fullName,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender as typeof GENDERS[number],
      phone: member.phone ?? '',
      email: member.email ?? '',
      departmentId:
        (typeof member.departmentId === 'object' ? member.departmentId._id : member.departmentId) as string,
      municipalityId:
        (typeof member.municipalityId === 'object' ? member.municipalityId._id : member.municipalityId) as string,
      addressDetails: member.addressDetails ?? '',
      family: member.family ?? [],
      status: member.status as typeof MEMBER_STATUSES[number],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'family',
  });

  const departmentId = form.watch('departmentId');

  const onSubmit = (values: EditFormValues) => {
    const dirty: Record<string, unknown> = {};

    for (const key of Object.keys(values) as (keyof EditFormValues)[]) {
      if (form.formState.dirtyFields[key]) {
        const val = values[key];
        if (val !== '' && val !== undefined) {
          dirty[key] = val;
        }
      }
    }

    // Always include family if modified
    if (form.formState.dirtyFields.family) {
      dirty.family = values.family;
    }

    if (Object.keys(dirty).length === 0) {
      onOpenChange(false);
      return;
    }

    updateMutation.mutate(
      { id: member._id, data: dirty as UpdateMemberPayload },
      {
        onSuccess: () => {
          notifyUpdated('Miembro', values.fullName ?? member.fullName);
          onOpenChange(false);
        },
      },
    );
  };

  const addFamilyMember = () => {
    append({ name: '', relationship: 'Otro', contactNumber: '', isMember: false });
  };

  return (
    <FormModal 
      open={open} 
      onOpenChange={onOpenChange} 
      title="Editar Miembro" 
      description="Modifica los datos personales, ubicación y núcleo familiar."
      size="5xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* ═══════ CONTENEDOR EN 2 COLUMNAS ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* COLUMNA IZQUIERDA: Datos Personales y Ubicación */}
            <div className="space-y-6">

              {/* Información Personal */}
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <SectionHeader icon={User} title="Información personal" />
                
                <FormInput name="fullName" control={form.control} label="Nombre completo" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormDatePicker name="dateOfBirth" control={form.control} label="Nacimiento" />
                  <FormSelect name="gender" control={form.control} label="Género" options={genderOptions} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput name="phone" control={form.control} label="Teléfono" />
                  <FormInput name="email" control={form.control} label="Correo" type="email" />
                </div>

                <FormSelect name="status" control={form.control} label="Estado actual" options={statusOptions} />
              </div>

              {/* Ubicación */}
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <SectionHeader icon={MapPin} title="Ubicación" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DepartmentSelect name="departmentId" control={form.control} />
                  <MunicipalitySelect
                    name="municipalityId"
                    control={form.control}
                    departmentId={departmentId}
                  />
                </div>
                
                <FormInput name="addressDetails" control={form.control} label="Dirección detallada" />
              </div>

            </div>

            {/* COLUMNA DERECHA: Familiares */}
            <div className="bg-muted/30 p-4 rounded-lg border flex flex-col h-full max-h-125">
              <div className="flex items-center justify-between mb-4">
                <SectionHeader icon={Users} title="Núcleo Familiar" />
                <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Agregar
                </Button>
              </div>

              {fields.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-md p-6">
                  <Users className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm text-center">No hay familiares registrados.</p>
                </div>
              )}

              <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                {fields.map((field, index) => (
                  <Card key={field.id} className="relative shadow-sm">
                    <CardContent className="pt-4 pb-3 px-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                        <FormInput name={`family.${index}.name`} control={form.control} label="Nombre" />
                        <FormSelect name={`family.${index}.relationship`} control={form.control} label="Parentesco" options={relationshipOptions} />
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row items-end gap-4">
                        <div className="flex-1 w-full">
                          <FormInput name={`family.${index}.contactNumber`} control={form.control} label="Teléfono" />
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                          <Checkbox
                            id={`edit-family-${index}-isMember`}
                            checked={form.watch(`family.${index}.isMember`)}
                            onCheckedChange={(checked) =>
                              form.setValue(`family.${index}.isMember`, checked === true)
                            }
                          />
                          <Label htmlFor={`edit-family-${index}-isMember`} className="text-sm cursor-pointer whitespace-nowrap">
                            Es miembro
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>

          <Separator />

          {/* ═══════ SUBMIT ═══════ */}
          <div className="flex justify-end">
            <FormSubmitButton
              isSubmitting={updateMutation.isPending}
              label="Guardar Cambios"
              loadingLabel="Actualizando en la base de datos..."
              className="w-full sm:w-auto px-8"
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}