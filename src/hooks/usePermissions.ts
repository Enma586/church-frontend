import { useAppSelector } from '@/store/hooks';
import { useConfig } from '@/features/config/hooks/useConfig';
import { useMemo } from 'react';
import type { PermissionKey } from '@/constants/permissions';
import { DEFAULT_ROLE_PERMISSIONS } from '@/constants/permissions';

/**
 * Hook that resolves the current user's effective permissions.
 *
 * Priority:
 *  1. Stored overrides in Configuration.rolePermissions (set via Roles page)
 *  2. DEFAULT_ROLE_PERMISSIONS (hardcoded fallback per role)
 *
 * @example
 * const { can } = usePermissions();
 * if (can('members:write')) { ... }
 */
export function usePermissions() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: configData } = useConfig();
  const config = configData?.data;

  const permissionSet = useMemo(() => {
    if (!user?.role) return new Set<PermissionKey>();

    const stored = (
      config?.rolePermissions as Record<string, PermissionKey[]> | undefined
    ) ?? {};
    const storedPerms = (stored[user.role] as PermissionKey[]) ?? [];
    const defaults = DEFAULT_ROLE_PERMISSIONS[user.role] ?? [];

    const effective = storedPerms.length > 0 ? storedPerms : defaults;
    return new Set(effective);
  }, [user?.role, config?.rolePermissions]);

  const can = (permission: PermissionKey): boolean =>
    permissionSet.has(permission);

  const canAll = (...permissions: PermissionKey[]): boolean =>
    permissions.every((p) => permissionSet.has(p));

  const canAny = (...permissions: PermissionKey[]): boolean =>
    permissions.some((p) => permissionSet.has(p));

  return { can, canAll, canAny, permissions: permissionSet };
}
