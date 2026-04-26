import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface FilterToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function FilterToggle({ label, checked, onChange }: FilterToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={`toggle-${label}`}
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label htmlFor={`toggle-${label}`} className="text-sm cursor-pointer">
        {label}
      </Label>
    </div>
  );
}