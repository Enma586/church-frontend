import { useState, useMemo } from 'react';
import { RoleCard } from '../components/RoleCard';
import { EditRoleModal } from '../modals/EditRoleModal';
import { useConfig } from '@/features/config/hooks/useConfig';
import { USER_ROLES } from '@/constants/roles';
import {
  DEFAULT_ROLE_PERMISSIONS,
  type PermissionKey,
} from '../../../constants/permissions';
import type { RoleData } from '../types/role.types';
import { Loader2 } from 'lucide-react';

export default function RolesPage() {
  const { data: configData, isLoading } = useConfig();
  const config = configData?.data;

  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);   // ← forzar re-render

  const roles: RoleData[] = useMemo(() => {
    const overrides = (config?.rolePermissions ?? {}) as Record<string, string[]>;

    return USER_ROLES.map((roleName) => {
      const defaults = DEFAULT_ROLE_PERMISSIONS[roleName] ?? [];
      const overridden = overrides[roleName] ?? [];
      const perms = overridden.length > 0 ? (overridden as PermissionKey[]) : defaults;
      return { role: roleName, permissions: perms };
    });
  }, [config, refreshKey]);   // ← refreshKey como dependencia

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los permisos de cada rol.
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
            if (!open) {
              setEditingRole(null);
              setRefreshKey((k) => k + 1);   // ← forzar refresh al cerrar
            }
          }}
          role={editingRole}
        />
      )}
    </div>
  );
}