import { useDepartments } from '../hooks/useDepartments';
import { FormSelect } from '@/components/forms/FormSelect';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface DepartmentSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
}

/**
 * Ready‑to‑use department dropdown backed by the API.
 * Intended to be dropped inside a react‑hook‑form.
 */
export function DepartmentSelect<T extends FieldValues>({
  name,
  control,
  label = 'Departamento',
}: DepartmentSelectProps<T>) {
  const { data: departments = [], isLoading } = useDepartments();

  const options = departments.map((d) => ({
    value: d._id,
    label: d.name,
  }));

  return (
    <FormSelect
      name={name}
      control={control}
      label={label}
      options={options}
      placeholder={isLoading ? 'Cargando...' : 'Seleccionar departamento'}
    />
  );
}