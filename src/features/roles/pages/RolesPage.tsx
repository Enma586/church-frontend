/**
 * @fileoverview Roles management page.
 * Displays available roles (Coordinador / Subcoordinador) as cards.
 * Clicking a card opens the EditRoleModal for permission toggling.
 * Since roles are hardcoded in the backend (enum on User model),
 * this page reads role definitions from frontend constants and
 * persisted permission overrides from the Configuration singleton.
 */
import { useState, useMemo } from 'react';
import { RoleCard } from '../components/RoleCard';
import { EditRoleModal } from '../modals/EditRoleModal';
import { useConfig } from '@/features/config/hooks/useConfig';
import { USER_ROLES } from '@/constants/roles';
import {
  DEFAULT_ROLE_PERMISSIONS,
  type PermissionKey,
} from '../constants/permissions';
import type { RoleData } from '../types/role.types';
import { Loader2 } from 'lucide-react';

export default function RolesPage() {
  const { data: configData, isLoading } = useConfig();
  const config = configData?.data;

  const [editingRole, setEditingRole] = useState<RoleData | null>(null);

  // Merge persisted overrides with defaults
  const roles: RoleData[] = useMemo(() => {
    const overrides = config?.rolePermissions ?? {};

    return USER_ROLES.map((roleName) => {
      const defaults = DEFAULT_ROLE_PERMISSIONS[roleName] ?? [];
      const overridden = (overrides[roleName] as PermissionKey[]) ?? [];
      // Use overrides if present, otherwise defaults
      const perms = overridden.length > 0 ? overridden : defaults;
      return { role: roleName, permissions: perms };
    });
  }, [config]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los permisos de cada rol. Los roles se asignan al crear o
            editar usuarios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roles.map((r) => (
          <RoleCard
            key={r.role}
            role={r}
            onClick={() => setEditingRole(r)}
          />
        ))}
      </div>

      {editingRole && (
        <EditRoleModal
          open={!!editingRole}
          onOpenChange={(open) => {
            if (!open) setEditingRole(null);
          }}
          role={editingRole}
        />
      )}
    </div>
  );
}