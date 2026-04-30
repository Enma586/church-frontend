import { useCallback, useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMembers } from '@/features/members/hooks/useMembers';
import type { PastoralNoteQueryParams } from '@/types';

interface Props {
  onApply: (filters: PastoralNoteQueryParams) => void;
  initialValues: PastoralNoteQueryParams;
}

export function PastoralNoteFilters({ onApply, initialValues }: Props) {
  const [memberId, setMemberId] = useState(initialValues.memberId ?? '__all__');
  const [isSensitive, setIsSensitive] = useState(
    initialValues.isSensitive !== undefined ? String(initialValues.isSensitive) : '__all__',
  );
  const { data: membersData } = useMembers({ limit: 100 });
  const members = membersData?.data ?? [];

  const handleApply = useCallback(() => {
    onApply({
      memberId: memberId !== '__all__' ? memberId : undefined,
      isSensitive: isSensitive !== '__all__' ? isSensitive === 'true' : undefined,
    });
  }, [memberId, isSensitive, onApply]);

  const handleClear = useCallback(() => {
    setMemberId('__all__');
    setIsSensitive('__all__');
    onApply({});
  }, [onApply]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select value={memberId} onValueChange={setMemberId}>
        <SelectTrigger className="h-9 w-55">
          <SelectValue placeholder="Miembro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los miembros</SelectItem>
          {members.map((m) => (
            <SelectItem key={m._id} value={m._id}>{m.fullName}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={isSensitive} onValueChange={setIsSensitive}>
        <SelectTrigger className="h-9 w-40">
          <SelectValue placeholder="Sensibilidad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todas</SelectItem>
          <SelectItem value="true">Sensibles</SelectItem>
          <SelectItem value="false">Normales</SelectItem>
        </SelectContent>
      </Select>

      <Button size="sm" onClick={handleApply}><Search className="mr-1.5 h-4 w-4" />Buscar</Button>
      <Button size="sm" variant="ghost" onClick={handleClear}><RotateCcw className="mr-1.5 h-4 w-4" />Limpiar</Button>
    </div>
  );
}