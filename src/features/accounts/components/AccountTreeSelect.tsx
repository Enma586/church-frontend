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

export type TreeSelectMode = 'parent' | 'transaction';

interface AccountTreeSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  /**
   * - 'parent': solo cuentas de agrupación (acceptsTransactions=false) están habilitadas.
   *   Se usa al crear/editar cuentas para asignar cuenta padre.
   * - 'transaction': solo cuentas hoja (acceptsTransactions=true) están habilitadas.
   *   Se usa en líneas de asientos contables.
   */
  mode?: TreeSelectMode;
}

const TYPE_ORDER: Record<string, number> = {
  Activo: 1,
  Pasivo: 2,
  Patrimonio: 3,
  Ingreso: 4,
  Gasto: 5,
};

/**
 * Selector jerárquico de cuentas contables agrupado por tipo.
 *
 * Modos:
 * - `parent` (default): selecciona cuentas de agrupación como padres.
 * - `transaction`: selecciona cuentas hoja para registrar transacciones.
 */
export function AccountTreeSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  mode = 'parent',
}: AccountTreeSelectProps<T>) {
  const { data, isLoading } = useAccounts({ limit: 1000, isActive: true });

  const accounts = (data?.data ?? []).filter((a) => a.isActive);

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

  /**
   * Determina si una cuenta debe estar deshabilitada según el modo.
   */
  const isAccountDisabled = (account: Account): boolean => {
    if (!account.isActive) return true;
    if (mode === 'parent') {
      // Solo cuentas de agrupación (acceptsTransactions=false) están habilitadas
      return account.acceptsTransactions;
    }
    // mode === 'transaction': solo cuentas hoja (acceptsTransactions=true) están habilitadas
    return !account.acceptsTransactions;
  };

  /**
   * Etiqueta de ayuda que explica por qué la cuenta está inhabilitada.
   */
  const getDisabledHint = (account: Account): string => {
    if (!account.isActive) return '(inactiva)';
    if (mode === 'parent' && account.acceptsTransactions) return '(cuenta hoja — no agrupa)';
    if (mode === 'transaction' && !account.acceptsTransactions) return '(cuenta de agrupación)';
    return '';
  };

  const finalPlaceholder = placeholder ?? (
    mode === 'parent'
      ? 'Ninguna (cuenta raíz)'
      : 'Seleccione una cuenta'
  );

  const showNullOption = mode === 'parent';

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(v) => field.onChange(v === 'null' ? null : v)}
            value={field.value ?? (showNullOption ? 'null' : '')}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={finalPlaceholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {showNullOption && (
                <SelectItem value="null">Ninguna (cuenta raíz)</SelectItem>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isLoading && accounts.length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No hay cuentas activas disponibles.
                </div>
              )}

              {sortedTypes.map((type) => {
                const typeAccounts = grouped[type];
                const hasEnabledAccounts = typeAccounts.some(
                  (a) => !isAccountDisabled(a),
                );

                return (
                  <SelectGroup key={type}>
                    <SelectLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      {type}
                      {!hasEnabledAccounts && (
                        <span className="ml-1 font-normal lowercase text-muted-foreground/60">
                          (sin cuentas disponibles)
                        </span>
                      )}
                    </SelectLabel>
                    {typeAccounts.map((account) => {
                      const disabled = isAccountDisabled(account);
                      const hint = getDisabledHint(account);

                      return (
                        <SelectItem
                          key={account._id}
                          value={account._id}
                          disabled={disabled}
                        >
                          <span className={disabled ? 'text-muted-foreground/60' : 'font-medium'}>
                            {account.code} — {account.name}
                          </span>
                          {hint && (
                            <span className="text-xs text-muted-foreground/70 ml-1.5">
                              {hint}
                            </span>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}