import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useState, useEffect } from 'react';

interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function FilterSearch({
  value,
  onChange,
  placeholder = 'Buscar...',
  debounceMs = 300,
}: FilterSearchProps) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, debounceMs);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    onChange(debounced);
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className="pl-9 pr-9"
      />
      {local && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-7 w-7"
          onClick={() => {
            setLocal('');
            onChange('');
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}