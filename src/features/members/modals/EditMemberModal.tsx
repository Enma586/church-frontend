//import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
// 1. Añadimos el import de FormSelect
import { FormSelect } from '@/components/forms/FormSelect';
import { DepartmentSelect } from '@/features/address/components/DepartmentSelect';
import { MunicipalitySelect } from '@/features/address/components/MunicipalitySelect';
import { useUpdateMember } from '../hooks/useUpdateMember';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { GENDERS } from '@/constants/gender';
import { MEMBER_STATUSES } from '@/constants/member-status';
import type { Member, UpdateMemberPayload } from '@/types';

const editSchema = z
  .object({
    fullName: z.string().trim().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(GENDERS).optional(),
    phone: z.string().trim().optional(),
    email: z.string().trim().email('Correo inválido').optional().or(z.literal('')),
    departmentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    municipalityId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    addressDetails: z.string().trim().optional(),
    status: z.enum(MEMBER_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe modificar al menos un campo',
  });

type EditFormValues = z.infer<typeof editSchema>;

interface EditMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
}

export function EditMemberModal({ open, onOpenChange, member }: EditMemberModalProps) {
  const updateMutation = useUpdateMember();
  const { notifyUpdated } = useNotificationActions();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      fullName: member.fullName,
      dateOfBirth: member.dateOfBirth.slice(0, 10),
      gender: member.gender,
      phone: member.phone ?? '',
      email: member.email ?? '',
      departmentId:
        typeof member.departmentId === 'object'
          ? member.departmentId._id
          : member.departmentId,
      municipalityId:
        typeof member.municipalityId === 'object'
          ? member.municipalityId._id
          : member.municipalityId,
      addressDetails: member.addressDetails ?? '',
      status: member.status,
    },
  });

  const departmentId = form.watch('departmentId');

  const onSubmit = async (values: EditFormValues) => {
    const dirtyFields = Object.fromEntries(
      Object.entries(values).filter(([key]) =>
        form.formState.dirtyFields[key as keyof typeof form.formState.dirtyFields],
      ),
    ) as UpdateMemberPayload;

    if (Object.keys(dirtyFields).length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: member._id, data: dirtyFields });
      notifyUpdated('Miembro', values.fullName ?? member.fullName);
      onOpenChange(false);
    } catch {
      // error handled by hook
    }
  };

  // 2. Formateamos las opciones del género
  const genderOptions = GENDERS.map((gender) => ({
    label: gender,
    value: gender,
  }));

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title="Editar miembro" size="xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput name="fullName" control={form.control} label="Nombre completo" />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormDatePicker name="dateOfBirth" control={form.control} label="Fecha de nacimiento" />
            <FormInput name="phone" control={form.control} label="Teléfono" />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput name="email" control={form.control} label="Correo electrónico" type="email" />
            {/* 3. Reemplazamos FormInput por FormSelect para el género */}
            <FormSelect 
              name="gender" 
              control={form.control} 
              label="Género" 
              options={genderOptions} 
            />
          </div>

          {/* 4. Agregamos de vuelta los selectores de ubicación que faltaban en tu JSX */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DepartmentSelect name="departmentId" control={form.control} />
            <MunicipalitySelect
              name="municipalityId"
              control={form.control}
              departmentId={departmentId}
            />
          </div>

          <FormInput name="addressDetails" control={form.control} label="Dirección detallada" />

          <FormSubmitButton
            isSubmitting={updateMutation.isPending}
            label="Guardar cambios"
            loadingLabel="Guardando..."
            className="w-full"
          />
        </form>
      </Form>
    </FormModal>
  );
}