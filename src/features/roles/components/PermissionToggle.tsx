/**
 * @fileoverview Individual toggle switch for a single permission.
 * Used inside the PermissionMatrix to enable/disable granular actions per role.
 */
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { PermissionKey } from '../../../constants/permissions';

interface PermissionToggleProps {
  permission: PermissionKey;
  label: string;
  enabled: boolean;
  /** Whether this toggle is disabled (e.g., Coordinador base permissions) */
  readOnly?: boolean;
  onChange: (permission: PermissionKey, enabled: boolean) => void;
}

export function PermissionToggle({
  permission,
  label,
  enabled,
  readOnly = false,
  onChange,
}: PermissionToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <Label
        htmlFor={`perm-${permission}`}
        className={`text-sm leading-tight flex-1 cursor-pointer ${
          readOnly ? 'text-muted-foreground' : ''
        }`}
      >
        {label}
        {readOnly && (
          <span className="ml-1.5 text-xs text-muted-foreground">(base)</span>
        )}
      </Label>
      <Switch
        id={`perm-${permission}`}
        checked={enabled}
        disabled={readOnly}
        onCheckedChange={(checked) => onChange(permission, checked)}
      />
    </div>
  );
}