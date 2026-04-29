import { useMunicipalities } from '../hooks/useMunicipalities';
import { FormSelect } from '@/components/forms/FormSelect';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface MunicipalitySelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  departmentId?: string;
  label?: string;
}

/**
 * Municipality dropdown filtered by department.
 * Disabled until a department is selected.
 * Shows the actual error message when the API call fails.
 */
export function MunicipalitySelect<T extends FieldValues>({
  name,
  control,
  departmentId,
  label = 'Municipio',
}: MunicipalitySelectProps<T>) {
  const { data: municipalities = [], isLoading, isError, error } = useMunicipalities(departmentId);

  const options = municipalities.map((m) => ({ value: m._id, label: m.name }));

  let placeholder: string;
  if (!departmentId) {
    placeholder = '';
  } else if (isLoading) {
    placeholder = 'Cargando municipios...';
  } else if (isError) {
    placeholder = error instanceof Error ? error.message : 'Error al cargar';
  } else if (municipalities.length === 0) {
    placeholder = 'Sin municipios — ejecuta seed-honduras.js';
  } else {
    placeholder = 'Seleccionar municipio';
  }

  return (
    <FormSelect
      name={name}
      control={control}
      label={label}
      options={options}
      placeholder={placeholder}
    />
  );
}