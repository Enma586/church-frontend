import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCreateProduct } from '../hooks/useProductMutations';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
import type { CreateProductPayload } from '@/types';

const schema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  defaultPrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  incomeAccountId: z
    .string()
    .min(1, 'Debe seleccionar una cuenta de ingreso')
    .regex(/^[0-9a-fA-F]{24}$/, 'Cuenta de ingreso inválida'),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductModal({ open, onOpenChange }: Props) {
  const createMutation = useCreateProduct();

  // ═══════════════════════════════════════════════════════════════
  // Traemos TODAS las cuentas sin filtrar por type ni isActive.
  // Filtramos en cliente: tipo Ingreso + activas + aceptan transacciones.
  // ═══════════════════════════════════════════════════════════════
  const { data: accountsData, isLoading: loadingAccounts } = useAccounts({
    limit: 1000,
  });

  const ingresoAccounts = (accountsData?.data ?? []).filter(
    (a) =>
      a.type === 'Ingreso' &&
      a.isActive &&
      a.acceptsTransactions,
  );

  const accountOptions = ingresoAccounts.map((a) => ({
    value: a._id,
    label: `${a.code} — ${a.name}`,
  }));

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '',
      defaultPrice: 0,
      incomeAccountId: '',
      isActive: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync(
        values as unknown as CreateProductPayload,
      );
      form.reset();
      onOpenChange(false);
    } catch (error) {
      showToast.error(humanizeError(error));
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo Producto o Servicio"
      description="Registre un producto o servicio en el catálogo contable."
      size="lg"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormInput
            name="name"
            control={form.control}
            label="Nombre"
            placeholder="Ej: Certificado de Bautismo"
          />

          <FormInput
            name="defaultPrice"
            control={form.control as any}
            label="Precio por defecto (L.)"
            type="number"
            step="0.01"
            min="0"
          />

          <FormSelect
            name="incomeAccountId"
            control={form.control as any}
            label="Cuenta de ingreso"
            options={accountOptions}
            placeholder={
              loadingAccounts
                ? 'Cargando cuentas…'
                : accountOptions.length === 0
                  ? 'No hay cuentas de ingreso disponibles'
                  : 'Seleccione una cuenta de ingreso'
            }
            disabled={loadingAccounts || accountOptions.length === 0}
          />

          {!loadingAccounts && accountOptions.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No hay cuentas tipo Ingreso que acepten transacciones. Cree una
              cuenta con Tipo = Ingreso y "Acepta transacciones" activado.
            </p>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Switch
              id="product-isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(v) =>
                form.setValue('isActive', v, { shouldValidate: true })
              }
            />
            <Label htmlFor="product-isActive">Activo</Label>
          </div>

          <div className="flex justify-end pt-4">
            <FormSubmitButton
              isSubmitting={createMutation.isPending}
              label="Crear Producto"
              loadingLabel="Creando…"
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}