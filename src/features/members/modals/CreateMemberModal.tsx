import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
// 1. Importamos tu FormSelect personalizado
import { FormSelect } from '@/components/forms/FormSelect'; 
import { DepartmentSelect } from '@/features/address/components/DepartmentSelect';
import { MunicipalitySelect } from '@/features/address/components/MunicipalitySelect';
import { useCreateMember } from '../hooks/useCreateMember';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { GENDERS } from '@/constants/gender';
import { MEMBER_STATUSES } from '@/constants/member-status';
import type { CreateMemberPayload } from '@/types';

const createSchema = z.object({
  fullName: z.string().trim().min(1, 'Requerido'),
  dateOfBirth: z.string().min(1, 'Requerida'),
  gender: z.enum(GENDERS),
  phone: z.string().trim().optional(),
  email: z.string().trim().email('Correo inválido').optional().or(z.literal('')),
  departmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Requerido'),
  municipalityId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Requerido'),
  addressDetails: z.string().trim().optional(),
  status: z.enum(MEMBER_STATUSES).optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

interface CreateMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMemberModal({ open, onOpenChange }: CreateMemberModalProps) {
  const createMutation = useCreateMember();
  const { notifyCreated } = useNotificationActions();

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: '',
      gender: 'Masculino',
      phone: '',
      email: '',
      departmentId: '',
      municipalityId: '',
      addressDetails: '',
      status: 'Activo',
    },
  });

  const departmentId = form.watch('departmentId');

  useEffect(() => {
    form.setValue('municipalityId', '');
  }, [departmentId, form]);

  const onSubmit = async (values: CreateFormValues) => {
    const { ...payload } = values;

    try {
      await createMutation.mutateAsync(payload as CreateMemberPayload);
      notifyCreated('Miembro', payload.fullName);
      form.reset();
      onOpenChange(false);
    } catch {
      // error handled by hook's onError
    }
  };

  // Convertimos tu arreglo de GENDERS en el formato { label, value } que espera el select
  const genderOptions = GENDERS.map((gender) => ({
    label: gender,
    value: gender,
  }));

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo miembro"
      description="Completa los datos para registrar un nuevo miembro."
      size="xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput name="fullName" control={form.control} label="Nombre completo" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormDatePicker name="dateOfBirth" control={form.control} label="Fecha de nacimiento" />
            <FormInput name="phone" control={form.control} label="Teléfono" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput name="email" control={form.control} label="Correo electrónico" type="email" />
            
            {/* 2. Usamos el FormSelect con las opciones de género */}
            <FormSelect 
              name="gender" 
              control={form.control} 
              label="Género" 
              options={genderOptions}
            />

          </div>
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
            isSubmitting={createMutation.isPending}
            label="Crear miembro"
            loadingLabel="Creando..."
            className="w-full"
          />
        </form>
      </Form>
    </FormModal>
  );
}