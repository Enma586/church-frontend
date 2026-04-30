import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { USER_ROLES } from '@/constants/roles';
import type { User, UpdateUserPayload } from '@/types';

const roleOptions = USER_ROLES.map((r) => ({ value: r, label: r }));
const activeOptions = [
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
];

const editSchema = z.object({
  username: z.string().trim().toLowerCase().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  role: z.enum(USER_ROLES).optional(),
  isActive: z.coerce.boolean().optional(),
});

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditUserModal({ open, onOpenChange, user }: EditUserModalProps) {
  const updateMutation = useUpdateUser();
  const { notifyUpdated } = useNotificationActions();

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      username: user.username,
      password: '',
      role: user.role as typeof USER_ROLES[number],
      isActive: user.isActive,
    },
  });

  const onSubmit = (values: z.infer<typeof editSchema>) => {
    const dirty: Record<string, unknown> = {};

    for (const key of ['username', 'password', 'role', 'isActive'] as const) {
      if (form.formState.dirtyFields[key] || (key === 'password' && values.password)) {
        const val = values[key];
        if (val !== '' && val !== undefined) {
          dirty[key] = val;
        }
      }
    }

    if (Object.keys(dirty).length === 0) {
      onOpenChange(false);
      return;
    }

    updateMutation.mutate(
      { id: user._id, data: dirty as UpdateUserPayload },
      {
        onSuccess: () => {
          notifyUpdated('Usuario', values.username ?? user.username);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title="Editar usuario" size="md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
            <FormInput name="username" control={form.control} label="Nombre de usuario" />
            <FormInput name="password" control={form.control} label="Nueva contraseña (dejar vacío para no cambiar)" type="password" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect name="role" control={form.control} label="Rol" options={roleOptions} />
              <FormSelect name="isActive" control={form.control} label="Estado" options={activeOptions} />
            </div>
          </div>

          <div className="flex justify-end">
            <FormSubmitButton isSubmitting={updateMutation.isPending} label="Guardar cambios" loadingLabel="Guardando..." className="w-full sm:w-auto px-8" />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}