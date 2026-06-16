import { useEffect } from 'react';
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
import { useUpdateProduct } from '../hooks/useProductMutations';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
import type { Product, UpdateProductPayload } from '@/types';

const schema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  defaultPrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  incomeAccountId: z
    .string()
    .min(1, 'Debe seleccionar una cuenta de ingreso')
    .uuid( 'Cuenta de ingreso inválida'),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

function getIncomeAccountId(product: Product): string {
  const account = product.incomeAccountId;
  if (account === null || account === undefined) return '';
  if (typeof account === 'object') return account._id;
  return account;
}

export function EditProductModal({ open, onOpenChange, product }: Props) {
  const updateMutation = useUpdateProduct();

  // ═══════════════════════════════════════════════════════════════
  // Sin filtros API. Todo en cliente.
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
      name: product.name,
      defaultPrice: product.defaultPrice,
      incomeAccountId: getIncomeAccountId(product),
      isActive: product.isActive,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: product.name,
        defaultPrice: product.defaultPrice,
        incomeAccountId: getIncomeAccountId(product),
        isActive: product.isActive,
      });
    }
  }, [open, product, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: product._id,
        data: values as UpdateProductPayload,
      });
      onOpenChange(false);
    } catch (error) {
      showToast.error(humanizeError(error));
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Producto"
      description={`Editando: ${product.name}`}
      size="lg"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormInput name="name" control={form.control} label="Nombre" />

          <FormInput
            name="defaultPrice"
            control={form.control}
            label="Precio por defecto (L.)"
            type="number"
            step="0.01"
            min="0"
          />

          <FormSelect
            name="incomeAccountId"
            control={form.control}
            label="Cuenta de ingreso"
            options={accountOptions}
            placeholder={
              loadingAccounts
                ? 'Cargando…'
                : accountOptions.length === 0
                  ? 'No hay cuentas disponibles'
                  : 'Seleccione una cuenta de ingreso'
            }
            disabled={loadingAccounts || accountOptions.length === 0}
          />

          <div className="flex items-center gap-2 pt-2">
            <Switch
              id="edit-product-isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(v) => form.setValue('isActive', v)}
            />
            <Label htmlFor="edit-product-isActive">Activo</Label>
          </div>

          <div className="flex justify-end pt-4">
            <FormSubmitButton
              isSubmitting={updateMutation.isPending}
              label="Guardar Cambios"
              loadingLabel="Guardando..."
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}