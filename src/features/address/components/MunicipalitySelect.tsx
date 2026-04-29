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
 * Municipality dropdown that reacts to the selected department.
 * When departmentId is empty the select shows a placeholder and is disabled.
 */
export function MunicipalitySelect<T extends FieldValues>({
  name,
  control,
  departmentId,
  label = 'Municipio',
}: MunicipalitySelectProps<T>) {
  const { data: municipalities = [], isLoading } = useMunicipalities(departmentId);

  const options = municipalities.map((m) => ({
    value: m._id,
    label: m.name,
  }));

  return (
    <FormSelect
      name={name}
      control={control}
      label={label}
      options={options}
      placeholder={
        !departmentId
          ? 'Primero selecciona un departamento'
          : isLoading
            ? 'Cargando...'
            : 'Seleccionar municipio'
      }
    />
  );
}