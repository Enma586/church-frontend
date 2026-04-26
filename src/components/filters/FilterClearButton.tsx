import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterClearButtonProps {
  onClick: () => void;
  visible?: boolean;
}

export function FilterClearButton({ onClick, visible = true }: FilterClearButtonProps) {
  if (!visible) return null;

  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <X className="mr-1 h-3.5 w-3.5" />
      Limpiar filtros
    </Button>
  );
}