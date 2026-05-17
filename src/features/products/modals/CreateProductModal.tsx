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
import type { CreateProductPayload } from '@/types';

const schema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  defaultPrice: z.number().min(0),
  incomeAccountId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Cuenta de ingreso requerida'),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductModal({ open, onOpenChange }: Props) {
  const createMutation = useCreateProduct();
  const { data: accountsData, isLoading: loadingAccounts } = useAccounts({
    type: 'Ingreso',
    limit: 1000,
    isActive: true,
  });

  const ingresoAccounts = accountsData?.data ?? [];
  const accountOptions = ingresoAccounts.map((a) => ({
    value: a._id,
    label: `${a.code} — ${a.name}`,
  }));

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      defaultPrice: 0,
      incomeAccountId: '',
      isActive: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync(values as unknown as CreateProductPayload);
      form.reset();
      onOpenChange(false);
    } catch {
      // handled by hook
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo Producto o Servicio"
      description="Registra un producto o servicio en el catálogo."
      size="lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="name"
            control={form.control}
            label="Nombre"
            placeholder="Ej: Certificado de Bautismo"
          />

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
            placeholder={loadingAccounts ? 'Cargando cuentas...' : 'Seleccionar cuenta de ingreso...'}
            disabled={loadingAccounts}
          />

          <div className="flex items-center gap-2 pt-2">
            <Switch
              id="product-isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(v) => form.setValue('isActive', v, { shouldValidate: true })}
            />
            <Label htmlFor="product-isActive">Activo</Label>
          </div>

          <div className="flex justify-end pt-4">
            <FormSubmitButton
              isSubmitting={createMutation.isPending}
              label="Crear Producto"
              loadingLabel="Creando..."
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}