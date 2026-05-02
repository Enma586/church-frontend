import { useState, useMemo, useCallback } from 'react';
import { Check, ChevronsUpDown, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useMembers } from '@/features/members/hooks/useMembers';

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function MultiMemberSelect({
  value,
  onChange,
  placeholder = 'Seleccionar miembros...',
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: membersData, isLoading } = useMembers({
    search: search || undefined,
    limit: 200,
  });
  const members = membersData?.data ?? [];

  const selectedSet = useMemo(() => new Set(value), [value]);
  const selectedMembers = members.filter((m) => selectedSet.has(m._id));

  const toggle = useCallback(
    (id: string) => {
      selectedSet.has(id)
        ? onChange(value.filter((v) => v !== id))
        : onChange([...value, id]);
    },
    [value, selectedSet, onChange],
  );

  const remove = (id: string) => onChange(value.filter((v) => v !== id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto min-h-10"
          >
            {selectedMembers.length > 0 ? (
              <span className="text-sm text-muted-foreground">
                {selectedMembers.length} selected
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-100 p-0" align="start">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <ScrollArea className="h-60">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Loading...
              </div>
            ) : members.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No results
              </div>
            ) : (
              members.map((m) => {
                const isSelected = selectedSet.has(m._id);
                return (
                  <button
                    key={m._id}
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors',
                      isSelected && 'bg-accent',
                    )}
                    onClick={() => toggle(m._id)}
                  >
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="flex-1 text-left">{m.fullName}</span>
                  </button>
                );
              })
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedMembers.map((m) => (
            <Badge key={m._id} variant="secondary" className="gap-1">
              {m.fullName}
              <button
                type="button"
                onClick={() => remove(m._id)}
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}