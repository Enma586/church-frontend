import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AccountTreeSelect } from '@/features/accounts/components/AccountTreeSelect';
import type { Control, UseFormWatch, UseFormSetValue, FieldPath, FieldValues } from 'react-hook-form';

interface JournalLineForm {
  account: string;
  debit: number;
  credit: number;
  description: string;
}

interface Props<T extends FieldValues> {
  control: Control<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  name: string;
}

export function JournalLinesTable<T extends FieldValues>({
  control,
  watch,
  setValue,
  name,
}: Props<T>) {
  
  // FIX: Función helper para extraer las líneas saltando el bloqueo de "readonly" de TypeScript
  const getLines = (): JournalLineForm[] => {
    const current = watch(name as FieldPath<T>);
    return ((current as unknown) as JournalLineForm[]) || [];
  };

  const lines = getLines();

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = lines.length >= 2 && totalDebit > 0 && totalDebit === totalCredit;

  const addLine = () => {
    const current = getLines();
    // FIX: Se usa 'as any' en el payload para evitar conflictos de profundidad con el genérico T
    setValue(name as FieldPath<T>, [
      ...current,
      { account: '', debit: 0, credit: 0, description: '' },
    ] as any);
  };

  const removeLine = (index: number) => {
    const current = getLines();
    setValue(
      name as FieldPath<T>,
      current.filter((_, i) => i !== index) as any
    );
  };

  const updateLine = (index: number, field: keyof JournalLineForm, value: string | number) => {
    const current = [...lines];
    const updated = { ...current[index], [field]: value };

    if (field === 'debit' && Number(value) > 0) {
      updated.credit = 0;
    }
    if (field === 'credit' && Number(value) > 0) {
      updated.debit = 0;
    }

    current[index] = updated;
    setValue(name as FieldPath<T>, current as any);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Líneas del Asiento</h4>
        <Button type="button" variant="outline" size="sm" onClick={addLine}>
          <Plus className="mr-1 h-4 w-4" />
          Agregar línea
        </Button>
      </div>

      {lines.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
          Agrega al menos 2 líneas para crear un asiento contable.
        </p>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {lines.map((line, index) => (
          <Card key={index} className="relative">
            <CardContent className="pt-4 pb-3 px-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10"
                onClick={() => removeLine(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pr-8">
                <div className="sm:col-span-4">
                  <AccountTreeSelect
                    name={`${name}.${index}.account` as FieldPath<T>}
                    control={control}
                    label="Cuenta"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Débito</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={line.debit || ''}
                    onChange={(e) => updateLine(index, 'debit', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Crédito</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={line.credit || ''}
                    onChange={(e) => updateLine(index, 'credit', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    placeholder="Detalle de la línea"
                    value={line.description || ''}
                    onChange={(e) => updateLine(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lines.length > 0 && (
        <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm pt-2 border-t">
          <span>
            <strong>Total Débito:</strong>{' '}
            <span className="tabular-nums">L. {totalDebit.toFixed(2)}</span>
          </span>
          <span>
            <strong>Total Crédito:</strong>{' '}
            <span className="tabular-nums">L. {totalCredit.toFixed(2)}</span>
          </span>
          <span>
            <strong>Diferencia:</strong>{' '}
            <span
              className={`tabular-nums font-bold ${balanced ? 'text-green-600' : 'text-red-600'}`}
            >
              L. {(totalDebit - totalCredit).toFixed(2)}
            </span>
          </span>
          {balanced && lines.length >= 2 && (
            <span className="text-green-600 font-medium">✓ Balanceado</span>
          )}
        </div>
      )}
    </div>
  );
}