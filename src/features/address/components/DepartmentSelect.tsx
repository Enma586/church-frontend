import { useDepartments } from '../hooks/useDepartments';
import { FormSelect } from '@/components/forms/FormSelect';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface DepartmentSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
}

/**
 * Department dropdown backed by the API.
 * Shows contextual placeholders: loading > error (with message) > empty > ready.
 */
export function DepartmentSelect<T extends FieldValues>({
  name,
  control,
  label = 'Departamento',
}: DepartmentSelectProps<T>) {
  const { data: departments = [], isLoading, isError, error } = useDepartments();

  const options = departments.map((d) => ({ value: d._id, label: d.name }));

  const placeholder = isLoading
    ? 'Cargando departamentos...'
    : isError
      ? (error instanceof Error ? error.message : 'Error al cargar')
      : departments.length === 0
        ? 'Sin departamentos — ejecuta seed-honduras.js'
        : 'Seleccionar departamento';

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