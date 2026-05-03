/**
 * @fileoverview Matrix grid displaying permissions grouped by domain.
 * Renders PermissionToggles for each permission in the active role.
 */
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  type PermissionKey,
} from '../../../constants/permissions';
import { PermissionToggle } from './PermissionToggle';

interface PermissionMatrixProps {
  /** Currently assigned permissions for the role being edited */
  permissions: PermissionKey[];
  /** Which permissions cannot be toggled (e.g., Coordinador base set) */
  immutable?: PermissionKey[];
  onChange: (permission: PermissionKey, enabled: boolean) => void;
  disabled?: boolean;
}

export function PermissionMatrix({
  permissions,
  immutable = [],
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  const permSet = new Set(permissions);
  const immutableSet = new Set(immutable);

  return (
    <div className="space-y-4">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.label} className="rounded-lg border bg-muted/20 p-3">
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {group.label}
          </h4>
          <div className="space-y-0.5">
            {group.keys.map((perm) => (
              <PermissionToggle
                key={perm}
                permission={perm}
                label={PERMISSION_LABELS[perm]}
                enabled={permSet.has(perm)}
                readOnly={immutableSet.has(perm) || disabled}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}