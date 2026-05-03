/**
 * @fileoverview Type definitions for the Roles feature.
 */

import type { PermissionKey } from '../../../constants/permissions';
import type { UserRole } from '@/constants';

export interface RoleData {
  /** Role identifier (e.g., "Coordinador", "Subcoordinador") */
  role: UserRole;
  /** Granular permissions assigned to this role */
  permissions: PermissionKey[];
}

export interface UpdateRolePermissionsPayload {
  role: UserRole;
  permissions: PermissionKey[];
}