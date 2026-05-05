import { useState, useEffect, useCallback } from 'react';
import { FormModal } from '@/components/modals/FormModal';
import { Button } from '@/components/ui/button';
import { PermissionMatrix } from '../components/PermissionMatrix';
import { useUpdateConfig, useConfig } from '@/features/config/hooks/useConfig';
import { showToast } from '@/lib/toast';
import type { RoleData } from '../types/role.types';
import type { PermissionKey } from '../../../constants/permissions';
import { DEFAULT_ROLE_PERMISSIONS } from '../../../constants/permissions';

interface EditRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleData;
}

export function EditRoleModal({ open, onOpenChange, role }: EditRoleModalProps) {
  const [permissions, setPermissions] = useState<PermissionKey[]>(role.permissions);
  const updateConfig = useUpdateConfig();
  const { data: configData } = useConfig();
  const existingConfig = configData?.data;

  

  useEffect(() => {
    if (open) setPermissions(role.permissions);
  }, [open, role]);

  const immutable: PermissionKey[] =
    role.role === 'Coordinador'
      ? DEFAULT_ROLE_PERMISSIONS.Coordinador
      : [
          'dashboard:view', 'members:read', 'appointments:read',
          'schedule:read', 'sacraments:read', 'pastoral_notes:read',
          'users:read', 'roles:read', 'config:read',
        ];

  const handleToggle = useCallback(
    (perm: PermissionKey, enabled: boolean) => {
      setPermissions((prev) =>
        enabled
          ? [...new Set([...prev, perm])]
          : prev.filter((p) => p !== perm),
      );
    },
    [permissions],
  );

  const handleSave = () => {
    const currentPermissions = existingConfig?.rolePermissions ?? {};
    const merged = {
      ...currentPermissions,
      [role.role]: permissions,
    };

    updateConfig.mutate(
      { rolePermissions: merged } as Record<string, unknown>,
      {
        onSuccess: () => {
          showToast.success(`Permisos de "${role.role}" actualizados`);
          onOpenChange(false);
        },
        onError: (err: Error) => {
          showToast.error(err.message);
        },
      },
    );
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Editar permisos — ${role.role}`}
      description="Activa o desactiva los permisos para este rol. Los permisos base no se pueden modificar."
      size="2xl"
    >
      <div className="flex flex-col gap-4">
        <PermissionMatrix
          permissions={permissions}
          immutable={immutable}
          onChange={handleToggle}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </FormModal>
  );
}