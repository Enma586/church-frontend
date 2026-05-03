/**
 * @fileoverview Permission definitions for role-based access control (RBAC).
 * Each permission represents a granular action within a domain module.
 */

export const PERMISSION_KEYS = [
  // ── Dashboard ──
  'dashboard:view',

  // ── Miembros ──
  'members:read',
  'members:write',

  // ── Agenda / Citas ──
  'appointments:read',
  'appointments:write',

  // ── Cronograma ──
  'schedule:read',
  'schedule:write',

  // ── Vida Espiritual ──
  'sacraments:read',
  'sacraments:write',
  'pastoral_notes:read',
  'pastoral_notes:write',

  // ── Administración ──
  'users:read',
  'users:write',
  'roles:read',
  'roles:write',
  'config:read',
  'config:write',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

/** Human-readable Spanish label for each permission */
export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  'dashboard:view': 'Ver Dashboard',

  'members:read': 'Ver miembros',
  'members:write': 'Crear / Editar miembros',

  'appointments:read': 'Ver citas',
  'appointments:write': 'Crear / Editar citas',

  'schedule:read': 'Ver cronograma',
  'schedule:write': 'Crear / Editar cronograma',

  'sacraments:read': 'Ver sacramentos',
  'sacraments:write': 'Registrar / Editar sacramentos',

  'pastoral_notes:read': 'Ver notas pastorales',
  'pastoral_notes:write': 'Crear / Editar notas',

  'users:read': 'Ver usuarios',
  'users:write': 'Crear / Editar usuarios',

  'roles:read': 'Ver roles',
  'roles:write': 'Editar permisos de roles',

  'config:read': 'Ver configuración',
  'config:write': 'Editar configuración',
};

/** Group permissions by domain for the UI */
export const PERMISSION_GROUPS: { label: string; keys: PermissionKey[] }[] = [
  {
    label: 'Principal',
    keys: ['dashboard:view'],
  },
  {
    label: 'Miembros',
    keys: ['members:read', 'members:write'],
  },
  {
    label: 'Agenda',
    keys: ['appointments:read', 'appointments:write', 'schedule:read', 'schedule:write'],
  },
  {
    label: 'Vida Espiritual',
    keys: ['sacraments:read', 'sacraments:write', 'pastoral_notes:read', 'pastoral_notes:write'],
  },
  {
    label: 'Administración',
    keys: ['users:read', 'users:write', 'roles:read', 'roles:write', 'config:read', 'config:write'],
  },
];

/**
 * Default permissions per role.
 * Coordinador gets everything, Subcoordinador gets read + some write.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  Coordinador: [...PERMISSION_KEYS],
  Subcoordinador: [
    'dashboard:view',
    'members:read',
    'members:write',
    'appointments:read',
    'appointments:write',
    'schedule:read',
    'schedule:write',
    'sacraments:read',
    'sacraments:write',
    'pastoral_notes:read',
    'pastoral_notes:write',
    'users:read',
    'roles:read',
    'config:read',
  ],
};