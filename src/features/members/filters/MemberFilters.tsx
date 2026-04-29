import { useCallback, useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterSearch } from '@/components/filters/FilterSearch';
import { useDepartments } from '@/features/address/hooks/useDepartments';
import { MEMBER_STATUSES } from '@/constants/member-status';
import { GENDERS } from '@/constants/gender';
import type { MemberQueryParams } from '@/types';

interface MemberFiltersProps {
  onApply: (filters: MemberQueryParams) => void;
  initialValues: MemberQueryParams;
}

const STATUS_OPTIONS = [
  { value: '__all__', label: 'Todos' },
  ...MEMBER_STATUSES.map((s) => ({ value: s, label: s })),
];

const GENDER_OPTIONS = [
  { value: '__all__', label: 'Todos' },
  ...GENDERS.map((g) => ({ value: g, label: g })),
];

/**
 * Filter bar for the members list page.
 * Uses local state + an explicit "Search" button.
 */
export function MemberFilters({ onApply, initialValues }: MemberFiltersProps) {
  const [search, setSearch] = useState(initialValues.search ?? '');
  const [status, setStatus] = useState(initialValues.status ?? '__all__');
  const [gender, setGender] = useState(initialValues.gender ?? '__all__');
  const [departmentId, setDepartmentId] = useState(initialValues.departmentId ?? '__all__');
  const { data: departments = [] } = useDepartments();

  const handleApply = useCallback(() => {
    onApply({
      search: search || undefined,
      status: status !== '__all__' ? (status as MemberQueryParams['status']) : undefined,
      gender: gender !== '__all__' ? (gender as MemberQueryParams['gender']) : undefined,
      departmentId: departmentId !== '__all__' ? departmentId : undefined,
    });
  }, [search, status, gender, departmentId, onApply]);

  const handleClear = useCallback(() => {
    setSearch('');
    setStatus('__all__');
    setGender('__all__');
    setDepartmentId('__all__');
    onApply({});
  }, [onApply]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <FilterSearch value={search} onChange={setSearch} placeholder="Buscar miembro..." />

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="h-9 w-37.5">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={gender} onValueChange={setGender}>
        <SelectTrigger className="h-9 w-37.5">
          <SelectValue placeholder="Género" />
        </SelectTrigger>
        <SelectContent>
          {GENDER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={departmentId} onValueChange={setDepartmentId}>
        <SelectTrigger className="h-9 w-50">
          <SelectValue placeholder="Departamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d._id} value={d._id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button size="sm" onClick={handleApply}>
        <Search className="mr-1.5 h-4 w-4" />
        Buscar
      </Button>

      <Button size="sm" variant="ghost" onClick={handleClear}>
        <RotateCcw className="mr-1.5 h-4 w-4" />
        Limpiar
      </Button>
    </div>
  );
}