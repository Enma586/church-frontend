import { useCallback, useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
//import { FilterSearch } from '@/components/filters/FilterSearch';
import { FilterDateRange } from '@/components/filters/FilterDateRange';
import { useMembers } from '@/features/members/hooks/useMembers';
import { SACRAMENT_TYPES } from '@/constants/sacrament-types';
import type { SacramentQueryParams } from '@/types';

interface SacramentFiltersProps {
  onApply: (filters: SacramentQueryParams) => void;
  initialValues: SacramentQueryParams;
}

const TYPE_OPTIONS = [
  { value: '__all__', label: 'Todos los tipos' },
  ...SACRAMENT_TYPES.map((t) => ({ value: t, label: t })),
];

export function SacramentFilters({ onApply, initialValues }: SacramentFiltersProps) {
  const [type, setType] = useState(initialValues.type ?? '__all__');
  const [memberId, setMemberId] = useState(initialValues.memberId ?? '__all__');
  const [dateFrom, setDateFrom] = useState(initialValues.dateFrom ?? '');
  const [dateTo, setDateTo] = useState(initialValues.dateTo ?? '');
  const { data: membersData } = useMembers({ limit: 100 });
  const members = membersData?.data ?? [];

  const handleApply = useCallback(() => {
    onApply({
      type: type !== '__all__' ? (type as SacramentQueryParams['type']) : undefined,
      memberId: memberId !== '__all__' ? memberId : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }, [type, memberId, dateFrom, dateTo, onApply]);

  const handleClear = useCallback(() => {
    setType('__all__');
    setMemberId('__all__');
    setDateFrom('');
    setDateTo('');
    onApply({});
  }, [onApply]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="h-9 w-50">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={memberId} onValueChange={setMemberId}>
        <SelectTrigger className="h-9 w-50">
          <SelectValue placeholder="Miembro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los miembros</SelectItem>
          {members.map((m) => (
            <SelectItem key={m._id} value={m._id}>{m.fullName}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FilterDateRange
        label="Fechas"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      <Button size="sm" onClick={handleApply}>
        <Search className="mr-1.5 h-4 w-4" /> Buscar
      </Button>

      <Button size="sm" variant="ghost" onClick={handleClear}>
        <RotateCcw className="mr-1.5 h-4 w-4" /> Limpiar
      </Button>
    </div>
  );
}