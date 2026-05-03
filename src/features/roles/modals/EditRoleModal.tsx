/**
 * @fileoverview Modal for editing permissions assigned to a specific role.
 * Displays a PermissionMatrix with toggles for each granular permission.
 * Saves changes to the system configuration (rolePermissions field).
 */
import { useState, useEffect, useCallback } from 'react';
import { FormModal } from '@/components/modals/FormModal';
import { Button } from '@/components/ui/button';
import { PermissionMatrix } from '../components/PermissionMatrix';
import { useUpdateConfig } from '@/features/config/hooks/useConfig';
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/lib/toast';
import type { RoleData } from '../types/role.types';
import type { PermissionKey, PERMISSION_KEYS } from '../constants/permissions';
import {
  DEFAULT_ROLE_PERMISSIONS,
} from '../../../constants/permissions';

interface EditRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleData;
}

export function EditRoleModal({ open, onOpenChange, role }: EditRoleModalProps) {
  const [permissions, setPermissions] = useState<PermissionKey[]>(role.permissions);
  const updateConfig = useUpdateConfig();
  const queryClient = useQueryClient();

  // Sync local state when role changes (modal opens with a different role)
  useEffect(() => {
    if (open) {
      setPermissions(role.permissions);
    }
  }, [open, role]);

  // Coordinador permissions are immutable (base set)
  const immutable: PermissionKey[] =
    role.role === 'Coordinador'
      ? DEFAULT_ROLE_PERMISSIONS.Coordinador
      : [
          'dashboard:view',
          'members:read',
          'appointments:read',
          'schedule:read',
          'sacraments:read',
          'pastoral_notes:read',
          'users:read',
          'roles:read',
          'config:read',
        ];

  const handleToggle = useCallback(
    (perm: PermissionKey, enabled: boolean) => {
      setPermissions((prev) =>
        enabled
          ? [...new Set([...prev, perm])]
          : prev.filter((p) => p !== perm),
      );
    },
    [],
  );

  const handleSave = () => {
    // Persist via Configuration API (rolePermissions field)
    updateConfig.mutate(
      { rolePermissions: { [role.role]: permissions } } as any,
      {
        onSuccess: () => {
          showToast.success(`Permisos de "${role.role}" actualizados`);
          queryClient.invalidateQueries({ queryKey: ['roles'] });
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateConfig.isPending}
          >
            {updateConfig.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </FormModal>
  );
}