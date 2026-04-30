import { useCallback, useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterSearch } from '@/components/filters/FilterSearch';
import { USER_ROLES } from '@/constants/roles';
import type { UserQueryParams } from '@/types';

interface UserFiltersProps {
  onApply: (filters: UserQueryParams) => void;
  initialValues: UserQueryParams;
}

const ROLE_OPTIONS = [
  { value: '__all__', label: 'Todos los roles' },
  ...USER_ROLES.map((r) => ({ value: r, label: r })),
];

const ACTIVE_OPTIONS = [
  { value: '__all__', label: 'Todos' },
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
];

export function UserFilters({ onApply, initialValues }: UserFiltersProps) {
  const [search, setSearch] = useState(initialValues.search ?? '');
  const [role, setRole] = useState(initialValues.role ?? '__all__');
  const [isActive, setIsActive] = useState(
    initialValues.isActive !== undefined ? String(initialValues.isActive) : '__all__',
  );

  const handleApply = useCallback(() => {
    onApply({
      search: search || undefined,
      role: role !== '__all__' ? (role as UserQueryParams['role']) : undefined,
      isActive: isActive !== '__all__' ? isActive === 'true' : undefined,
    });
  }, [search, role, isActive, onApply]);

  const handleClear = useCallback(() => {
    setSearch('');
    setRole('__all__');
    setIsActive('__all__');
    onApply({});
  }, [onApply]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <FilterSearch value={search} onChange={setSearch} placeholder="Buscar usuario..." />

      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="h-9 w-45">
          <SelectValue placeholder="Rol" />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={isActive} onValueChange={setIsActive}>
        <SelectTrigger className="h-9 w-35">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {ACTIVE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button size="sm" onClick={handleApply}>
        <Search className="mr-1.5 h-4 w-4" /> Buscar
      </Button>

      <Button size="sm" variant="ghost" onClick={handleClear}>
        <RotateCcw className="mr-1.5 h-4 w-4" /> Limpiar
      </Button>
    </div>
  );
}