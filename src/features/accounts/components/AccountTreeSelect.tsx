import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAccounts } from '../hooks/useAccounts';
import { Loader2 } from 'lucide-react';
import type { Account } from '@/types';

interface AccountTreeSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
}

const TYPE_ORDER: Record<string, number> = {
  Activo: 1,
  Pasivo: 2,
  Patrimonio: 3,
  Ingreso: 4,
  Gasto: 5,
};

export function AccountTreeSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Ninguna (cuenta raíz)',
}: AccountTreeSelectProps<T>) {
  const { data, isLoading } = useAccounts({ limit: 1000 });

  const accounts = data?.data ?? [];

  const grouped = accounts.reduce(
    (acc, account) => {
      const type = account.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    },
    {} as Record<string, Account[]>,
  );

  const sortedTypes = Object.keys(grouped).sort(
    (a, b) => (TYPE_ORDER[a] ?? 99) - (TYPE_ORDER[b] ?? 99),
  );

 // function getIndent(account: Account): number {
    // Buscar nivel jerárquico basado en parentAccount
   // let depth = 0;
    //let current = account;
    //while (current.parentAccount && typeof current.parentAccount === 'object') {
     // depth++;
      // No podemos seguir recursivamente sin más datos; max 3 niveles
      //if (depth > 3) break;
      //break; // Simplificado: solo mostramos un nivel de indentación
    //}
    //return 0; // Por simplicidad, sin indentación real
  //}

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(v) => field.onChange(v === 'null' ? null : v)}
            value={field.value ?? 'null'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="null">Ninguna (cuenta raíz)</SelectItem>
              {isLoading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {sortedTypes.map((type) => (
                <SelectGroup key={type}>
                  <SelectLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    {type}
                  </SelectLabel>
                  {grouped[type].map((account) => (
                    <SelectItem key={account._id} value={account._id} disabled={!account.isActive}>
                      <span className={account.acceptsTransactions ? '' : 'italic text-muted-foreground'}>
                        {account.code} — {account.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}