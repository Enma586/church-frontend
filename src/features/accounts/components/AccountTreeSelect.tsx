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
  mode?: TreeSelectMode;
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
  placeholder,
  mode = 'parent',
}: AccountTreeSelectProps<T>) {
  // ═════════════════════════════════════════════════════════════════
  // Traemos TODAS las cuentas sin ningún filtro a nivel API.
  // El backend devuelve la lista completa. Filtramos en cliente.
  // ═════════════════════════════════════════════════════════════════
  const { data, isLoading, isError } = useAccounts({ limit: 1000 });

  const allAccounts: Account[] = data?.data ?? [];

  // ── Deshabilitar según modo ──────────────────────────────────────
  const isDisabled = (a: Account): boolean => {
    if (!a.isActive) return true;
    if (mode === 'parent') return a.acceptsTransactions;
    return !a.acceptsTransactions; // transaction: deshabilita agrupación
  };

  const getHint = (a: Account): string | null => {
    if (!a.isActive) return 'Inactiva';
    if (mode === 'parent' && a.acceptsTransactions) return 'Hoja';
    if (mode === 'transaction' && !a.acceptsTransactions) return 'Agrupación';
    return null;
  };

  // ── Agrupar por tipo ordenado ────────────────────────────────────
  const grouped = allAccounts.reduce(
    (acc, a) => {
      (acc[a.type] ??= []).push(a);
      return acc;
    },
    {} as Record<string, Account[]>,
  );

  const sortedTypes = Object.keys(grouped).sort(
    (a, b) => (TYPE_ORDER[a] ?? 99) - (TYPE_ORDER[b] ?? 99),
  );

  const enabledCount = allAccounts.filter((a) => !isDisabled(a)).length;

  const finalPlaceholder =
    placeholder ??
    (mode === 'parent' ? 'Ninguna (cuenta raíz)' : 'Seleccione una cuenta');

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

              {/* ── Cargando ──────────────────────────────────── */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando…
                </div>
              )}

              {/* ── Error ─────────────────────────────────────── */}
              {!isLoading && isError && (
                <div className="px-3 py-4 text-sm text-destructive text-center">
                  Error al cargar cuentas. Abra la consola (F12) para ver el
                  detalle.
                </div>
              )}

              {/* ── Vacío total ───────────────────────────────── */}
              {!isLoading && !isError && allAccounts.length === 0 && (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  No hay cuentas registradas todavía.
                </div>
              )}

              {/* ── Todas deshabilitadas ───────────────────────── */}
              {!isLoading &&
                !isError &&
                allAccounts.length > 0 &&
                enabledCount === 0 && (
                  <div className="px-3 py-4 text-sm text-amber-600 dark:text-amber-400 text-center">
                    {mode === 'transaction'
                      ? 'Todas las cuentas son de agrupación. Cree una cuenta hoja (Acepta transacciones = Sí).'
                      : 'Todas las cuentas son hoja. Cree una cuenta de agrupación (Acepta transacciones = No).'}
                  </div>
                )}

              {/* ── Listado ────────────────────────────────────── */}
              {!isLoading &&
                !isError &&
                sortedTypes.map((type) => (
                  <SelectGroup key={type}>
                    <SelectLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      {type}
                    </SelectLabel>

                    {grouped[type].map((a) => {
                      const disabled = isDisabled(a);
                      const hint = getHint(a);

                      return (
                        <SelectItem
                          key={a._id}
                          value={a._id}
                          disabled={disabled}
                        >
                          <span
                            className={
                              disabled
                                ? 'text-muted-foreground/50'
                                : 'font-medium'
                            }
                          >
                            {a.code} — {a.name}
                          </span>
                          {hint && (
                            <span
                              className={`text-xs ml-1.5 ${
                                disabled
                                  ? 'text-muted-foreground/50'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {disabled ? `(${hint})` : `⚠ ${hint}`}
                            </span>
                          )}
                        </SelectItem>
                      );
                    })}
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