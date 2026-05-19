import { useQuery } from '@tanstack/react-query';
import { FormSelect } from '@/components/forms/FormSelect';
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'select-list'],
    // FIX 1: Quitamos el isActive por si tu backend no lo soporta aún. 
    // Solo pedimos los últimos 1000 productos.
    queryFn: () => productService.getAll({ limit: 1000 }),
    staleTime: 60000,
  });

  // FIX 2: DEBUG VISUAL. Abre la consola de tu navegador (F12) y mira qué imprime esto:
  console.log("Respuesta de la API de Productos:", data);
  if (error) console.error("Error cargando productos:", error);

  // FIX 3: Flexibilidad. Si el backend manda el arreglo directo, lo usamos. 
  // Si lo manda paginado dentro de .data, sacamos el .data.
  const products = Array.isArray(data) ? data : (data?.data ?? []);

  const productOptions = products.map((p: any) => ({
    value: p._id,
    label: `${p.name} (L. ${p.defaultPrice?.toFixed(2) ?? '0.00'})`,
  }));

  const optionsWithNone = [
    { value: 'none', label: '— Ninguno —' },
    ...productOptions,
  ];

  return (
    <FormSelect 
      name={name} 
      control={control as any} 
      label={label}
      options={optionsWithNone}
      placeholder={
        isLoading 
          ? 'Cargando productos...' 
          : error 
            ? 'Error al cargar' 
            : 'Seleccione un producto'
      }
      disabled={disabled || isLoading || !!error}
    />
  );
}