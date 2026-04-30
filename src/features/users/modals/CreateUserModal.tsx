import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { useCreateUser } from '../hooks/useCreateUser';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useUsers } from '../hooks/useUsers';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { USER_ROLES } from '@/constants/roles';
import { useMemo } from 'react';
import type { CreateUserPayload } from '@/types';

const roleOptions = USER_ROLES.map((r) => ({ value: r, label: r }));

const createSchema = z.object({
  memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Selecciona un miembro'),
  username: z.string().trim().toLowerCase().min(1, 'Requerido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(USER_ROLES).optional(),
});

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const createMutation = useCreateUser();
  const { notifyCreated } = useNotificationActions();
  const { data: membersData, isLoading: membersLoading } = useMembers({ limit: 100 });
  const { data: usersData } = useUsers({ limit: 100 });

  const members = membersData?.data ?? [];

  // Filtrar miembros que YA tienen usuario asignado
  const existingUserMemberIds = useMemo(() => {
    const ids = (usersData?.data ?? [])
      .filter((u) => u.memberId) // memberId puede ser null si no tiene miembro
      .map((u) => (typeof u.memberId === 'object' ? u.memberId._id : u.memberId));
    return new Set(ids);
  }, [usersData]);

  const availableMembers = useMemo(
    () => members.filter((m) => !existingUserMemberIds.has(m._id)),
    [members, existingUserMemberIds],
  );

  const memberOptions = availableMembers.map((m) => ({
    value: m._id,
    label: `${m.fullName}${m.email ? ` (${m.email})` : ''}`,
  }));

  const form = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: {
      memberId: '',
      username: '',
      password: '',
      role: 'Subcoordinador' as const,
    },
  });

  const onSubmit = async (values: z.infer<typeof createSchema>) => {
    try {
      await createMutation.mutateAsync(values as CreateUserPayload);
      notifyCreated('Usuario', values.username);
      form.reset();
      onOpenChange(false);
    } catch {
      // handled by hook
    }
  };

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title="Nuevo usuario" description="Asigna credenciales a un miembro sin usuario." size="md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
            <FormSelect
              name="memberId"
              control={form.control}
              label="Miembro"
              options={memberOptions}
              placeholder={membersLoading ? 'Cargando miembros...' : availableMembers.length === 0 ? 'Todos los miembros tienen usuario' : 'Seleccionar miembro...'}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput name="username" control={form.control} label="Nombre de usuario" placeholder="admin" />
              <FormInput name="password" control={form.control} label="Contraseña" type="password" placeholder="••••••" />
            </div>
            <FormSelect name="role" control={form.control} label="Rol" options={roleOptions} />
          </div>

          <div className="flex justify-end">
            <FormSubmitButton isSubmitting={createMutation.isPending} label="Crear usuario" loadingLabel="Creando..." className="w-full sm:w-auto px-8" />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}