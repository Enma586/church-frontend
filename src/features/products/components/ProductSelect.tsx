import { useQuery } from '@tanstack/react-query';
import { FormSelect } from '@/components/forms/FormSelect'; // FIX: Quitamos FormSelectItem
import { productService } from '@/features/products/services/product.service';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface Props<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  disabled?: boolean;
}

export function ProductSelect<T extends FieldValues>({ 
  name, 
  control, 
  label,
  disabled 
}: Props<T>) {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'select-list'],
    // FIX: Traemos todos los productos activos de un solo golpe
    queryFn: () => productService.getAll({ limit: 1000, isActive: true }),
    staleTime: 60000,
  });

  const products = data?.data ?? [];

  // FIX: Mapeamos los datos de la API al formato { value, label } que espera tu FormSelect
  const productOptions = products.map((p) => ({
    value: p._id,
    label: `${p.name} (L. ${p.defaultPrice?.toFixed(2) ?? '0.00'})`,
  }));

  // Agregamos la opción "Ninguno" o "Sin producto" al inicio de la lista
  const optionsWithNone = [
    { value: '', label: '— Ninguno —' },
    ...productOptions,
  ];

  return (
    <FormSelect 
      name={name} 
      control={control as any} 
      label={label}
      options={optionsWithNone} // Le pasamos el arreglo formateado
      placeholder={isLoading ? 'Cargando productos...' : 'Seleccione un producto'}
      disabled={disabled || isLoading}
    />
  );
}